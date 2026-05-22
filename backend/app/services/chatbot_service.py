import os
import json
from datetime import date, time, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, select, distinct
from groq import Groq

from app.models import (
    Utilisateur, Absence, Rattrapage, EmploiDuTemps,
    Matiere, Salle, RoleUtilisateur, StatutAbsence, StatutRattrapage,
    Groupe, etudiants_groupes
)
from app.services.absence_service import AbsenceService
from app.services.rattrapage_service import RattrapageService
from app.services.salle_service import SalleService
from app.services.emploi_du_temps_service import EmploiDuTempsService
from app.schemas.rattrapage import RattrapageCreate
from app.core.config import settings

# Retrieve Groq API Key from settings
GROQ_API_KEY = settings.GROQ_API_KEY or settings.AI_API_KEY

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_my_absences",
            "description": "Récupère les absences. Pour un enseignant, renvoie ses propres absences déclarées. Pour un étudiant, renvoie les absences des enseignants pour ses matières. Pour un administrateur, renvoie toutes les absences du système.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["en_attente", "valide", "rejete"],
                        "description": "Filtrer par statut de l'absence."
                    },
                    "date_from": {
                        "type": "string",
                        "format": "date",
                        "description": "Date de début au format YYYY-MM-DD"
                    },
                    "date_to": {
                        "type": "string",
                        "format": "date",
                        "description": "Date de fin au format YYYY-MM-DD"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_upcoming_rattrapages",
            "description": "Récupère les séances de rattrapage à venir ou programmées.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_timetable",
            "description": "Récupère l'emploi du temps hebdomadaire récurrent de l'utilisateur (enseignant ou étudiant).",
            "parameters": {
                "type": "object",
                "properties": {
                    "jour_semaine": {
                        "type": "integer",
                        "description": "Indice du jour de la semaine (0 pour Lundi, 1 pour Mardi, ..., 6 pour Dimanche)."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_available_rooms",
            "description": "Recherche les salles de cours disponibles pour une date et une plage horaire données.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Date de la recherche au format YYYY-MM-DD"
                    },
                    "heure_debut": {
                        "type": "string",
                        "description": "Heure de début au format HH:MM (ex: 08:30)"
                    },
                    "heure_fin": {
                        "type": "string",
                        "description": "Heure de fin au format HH:MM (ex: 10:30)"
                    }
                },
                "required": ["date", "heure_debut", "heure_fin"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "declare_absence",
            "description": "Déclare une absence pour l'enseignant connecté. Cette action nécessite une confirmation de l'utilisateur.",
            "parameters": {
                "type": "object",
                "properties": {
                    "matiere_nom": {
                        "type": "string",
                        "description": "Nom de la matière ou du cours (ex: Algorithmique, Algèbre)"
                    },
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Date de l'absence au format YYYY-MM-DD"
                    },
                    "motif": {
                        "type": "string",
                        "description": "Motif de l'absence"
                    }
                },
                "required": ["matiere_nom", "date", "motif"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "propose_rattrapage",
            "description": "Propose une séance de rattrapage pour une absence validée de l'enseignant. Cette action nécessite une confirmation de l'utilisateur.",
            "parameters": {
                "type": "object",
                "properties": {
                    "absence_id": {
                        "type": "integer",
                        "description": "Identifiant de l'absence à rattraper si connu."
                    },
                    "date_absence": {
                        "type": "string",
                        "format": "date",
                        "description": "Date de l'absence à rattraper au format YYYY-MM-DD (si ID inconnu)"
                    },
                    "matiere_nom": {
                        "type": "string",
                        "description": "Nom de la matière de l'absence à rattraper (si ID inconnu)"
                    },
                    "date_proposee": {
                        "type": "string",
                        "format": "date",
                        "description": "Date du rattrapage proposé au format YYYY-MM-DD"
                    },
                    "heure_debut": {
                        "type": "string",
                        "description": "Heure de début au format HH:MM (ex: 14:00)"
                    },
                    "heure_fin": {
                        "type": "string",
                        "description": "Heure de fin au format HH:MM (ex: 16:00)"
                    },
                    "salle_nom": {
                        "type": "string",
                        "description": "Nom de la salle proposée (ex: Salle 101, Amphi A)"
                    }
                },
                "required": ["date_proposee", "heure_debut", "heure_fin", "salle_nom"]
            }
        }
    }
]

DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

class ChatbotService:
    @staticmethod
    def get_system_prompt(user: Utilisateur) -> str:
        today_str = date.today().strftime("%Y-%m-%d")
        role_label = {
            RoleUtilisateur.ADMIN_SYSTEME: "Administrateur Système",
            RoleUtilisateur.ADMINISTRATION: "Administrateur",
            RoleUtilisateur.ENSEIGNANT: "Enseignant (Professeur)",
            RoleUtilisateur.ETUDIANT: "Étudiant"
        }.get(user.role, "Utilisateur")

        prompt = (
            f"Tu es l'assistant virtuel intelligent de la plateforme de gestion des absences et rattrapages des enseignants.\n"
            f"Tu interagis avec {user.prenom} {user.nom}, qui est connecté avec le rôle : {role_label}.\n"
            f"La date d'aujourd'hui est le {today_str}.\n\n"
            f"Règles importantes :\n"
            f"1. Reste poli, clair et concis. Réponds en français.\n"
            f"2. Utilise les outils/fonctions mis à ta disposition pour interroger la base de données ou initier des actions.\n"
            f"3. Si l'utilisateur demande une action d'écriture (comme déclarer une absence ou proposer un rattrapage), appelle la fonction correspondante (declare_absence ou propose_rattrapage). Le backend l'interceptera, validera les paramètres, et te retournera un état demandant confirmation ou affichera une erreur. Tu n'as pas besoin de dire que tu l'as déjà fait, appelle juste l'outil.\n"
            f"4. Ne propose que des actions adaptées au rôle de l'utilisateur :\n"
            f"   - Déclarer absence et proposer rattrapage sont exclusivement pour les ENSEIGNANTS.\n"
            f"   - Un étudiant peut demander ses cours, ses rattrapages prévus, et les absences de ses enseignants.\n"
            f"   - Un administrateur peut voir toutes les absences et tous les rattrapages.\n"
            f"5. Si des informations requises pour appeler un outil sont manquantes (ex: la matière ou le motif de l'absence), demande poliment ces précisions à l'utilisateur au lieu d'appeler l'outil avec des valeurs fictives.\n"
            f"6. Ne génère JAMAIS de texte au format XML ou HTML contenant des balises comme <function> ou </function> pour appeler les outils. Utilise exclusivement l'appel d'outil natif de l'API de manière transparente.\n"
        )
        return prompt

    @staticmethod
    def execute_query_tool(db: Session, user: Utilisateur, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes read-only query tools.
        Returns a dictionary representing the results.
        """
        try:
            if name == "get_my_absences":
                status_filter = None
                if args.get("status"):
                    from app.models.enums import StatutAbsence
                    status_filter = {
                        "en_attente": StatutAbsence.EN_ATTENTE,
                        "valide": StatutAbsence.VALIDE,
                        "rejete": StatutAbsence.REJETE
                    }.get(args["status"])

                date_from = None
                if args.get("date_from"):
                    date_from = date.fromisoformat(args["date_from"])

                date_to = None
                if args.get("date_to"):
                    date_to = date.fromisoformat(args["date_to"])

                # Query based on role
                if user.role in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
                    # Admin lists all absences
                    query = db.query(Absence).options(
                        joinedload(Absence.enseignant),
                        joinedload(Absence.matiere)
                    )
                    if status_filter:
                        query = query.filter(Absence.statut == status_filter)
                    if date_from:
                        query = query.filter(Absence.date_absence >= date_from)
                    if date_to:
                        query = query.filter(Absence.date_absence <= date_to)
                    absences = query.order_by(Absence.date_absence.desc()).limit(30).all()
                elif user.role == RoleUtilisateur.ENSEIGNANT:
                    # Teacher lists their own absences
                    query = db.query(Absence).options(joinedload(Absence.matiere)).filter(Absence.enseignant_id == user.id)
                    if status_filter:
                        query = query.filter(Absence.statut == status_filter)
                    if date_from:
                        query = query.filter(Absence.date_absence >= date_from)
                    if date_to:
                        query = query.filter(Absence.date_absence <= date_to)
                    absences = query.order_by(Absence.date_absence.desc()).limit(30).all()
                elif user.role == RoleUtilisateur.ETUDIANT:
                    # Student lists teachers absences in their groups
                    student_group_ids = [g[0] for g in db.query(etudiants_groupes.c.groupe_id).filter(etudiants_groupes.c.etudiant_id == user.id).all()]
                    if not student_group_ids:
                        return {"absences": [], "message": "Vous n'êtes inscrit dans aucun groupe."}
                    student_matiere_ids = [m[0] for m in db.query(distinct(EmploiDuTemps.matiere_id)).filter(EmploiDuTemps.groupe_id.in_(student_group_ids)).all()]
                    
                    query = db.query(Absence).options(
                        joinedload(Absence.enseignant),
                        joinedload(Absence.matiere)
                    ).filter(Absence.matiere_id.in_(student_matiere_ids))
                    if status_filter:
                        query = query.filter(Absence.statut == status_filter)
                    if date_from:
                        query = query.filter(Absence.date_absence >= date_from)
                    if date_to:
                        query = query.filter(Absence.date_absence <= date_to)
                    absences = query.order_by(Absence.date_absence.desc()).limit(30).all()
                else:
                    absences = []

                res_list = []
                for ab in absences:
                    teacher_name = f"{ab.enseignant.prenom} {ab.enseignant.nom}" if ab.enseignant else "Inconnu"
                    res_list.append({
                        "id": ab.id,
                        "date": ab.date_absence.isoformat(),
                        "matiere": ab.matiere.nom if ab.matiere else f"Matière ID {ab.matiere_id}",
                        "enseignant": teacher_name,
                        "motif": ab.motif,
                        "statut": ab.statut.value
                    })
                return {"absences": res_list}

            elif name == "get_upcoming_rattrapages":
                # Call RattrapageService.get_upcoming
                items, total = RattrapageService.get_upcoming(db, 1, 30, user.id, user.role)
                res_list = []
                for r in items:
                    teacher = r.absence.enseignant if r.absence else None
                    teacher_name = f"{teacher.prenom} {teacher.nom}" if teacher else "Inconnu"
                    res_list.append({
                        "id": r.id,
                        "date": r.date_proposee.isoformat(),
                        "heure_debut": r.heure_debut.strftime("%H:%M"),
                        "heure_fin": r.heure_fin.strftime("%H:%M"),
                        "matiere": r.absence.matiere.nom if r.absence and r.absence.matiere else "Matière inconnue",
                        "enseignant": teacher_name,
                        "salle": r.salle.nom if r.salle else f"Salle ID {r.salle_id}",
                        "statut": r.statut.value
                    })
                return {"rattrapages": res_list}

            elif name == "get_my_timetable":
                jour_semaine = args.get("jour_semaine")
                if user.role == RoleUtilisateur.ENSEIGNANT:
                    items, total = EmploiDuTempsService.get_by_enseignant(db, user.id, 1, 100, jour_semaine)
                elif user.role == RoleUtilisateur.ETUDIANT:
                    items, total = EmploiDuTempsService.get_by_etudiant(db, user.id, 1, 100, jour_semaine)
                else:
                    return {"message": "Cette information n'est disponible que pour les enseignants et étudiants."}

                res_list = []
                # Order by weekday, then start time
                sorted_items = sorted(items, key=lambda x: (x.jour_semaine, x.heure_debut))
                for item in sorted_items:
                    res_list.append({
                        "jour": DAY_NAMES[item.jour_semaine],
                        "jour_index": item.jour_semaine,
                        "heure_debut": item.heure_debut.strftime("%H:%M"),
                        "heure_fin": item.heure_fin.strftime("%H:%M"),
                        "matiere": item.matiere.nom if item.matiere else f"Matière ID {item.matiere_id}",
                        "salle": item.salle.nom if item.salle else f"Salle ID {item.salle_id}",
                        "groupe": item.groupe.nom if item.groupe else f"Groupe ID {item.groupe_id}"
                    })
                return {"emploi_du_temps": res_list}

            elif name == "get_available_rooms":
                target_date = date.fromisoformat(args["date"])
                start_time = time.fromisoformat(args["heure_debut"])
                end_time = time.fromisoformat(args["heure_fin"])
                items, total = SalleService.check_availability(db, target_date, start_time, end_time, 1, 30)
                
                res_list = []
                for s in items:
                    res_list.append({
                        "id": s.id,
                        "nom": s.nom,
                        "capacite": s.capacite
                    })
                return {
                    "date": args["date"],
                    "heure_debut": args["heure_debut"],
                    "heure_fin": args["heure_fin"],
                    "salles_disponibles": res_list,
                    "total": total
                }

        except Exception as e:
            return {"error": str(e)}

        return {"error": f"Outil '{name}' non reconnu ou non géré."}

    @staticmethod
    def validate_action_tool(db: Session, user: Utilisateur, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates arguments for action tools.
        If valid, returns a confirmation payload:
            { "type": "confirmation", "action": name, "params": {...}, "message": "Confirmation text" }
        If invalid, returns a plain text payload:
            { "type": "text", "content": "Error message explaining why the action is invalid" }
        """
        if user.role != RoleUtilisateur.ENSEIGNANT:
            return {
                "type": "text",
                "content": "Désolé, seules les personnes avec le rôle Enseignant peuvent effectuer cette action."
            }

        try:
            if name == "declare_absence":
                matiere_nom = args["matiere_nom"]
                date_absence_str = args["date"]
                motif = args["motif"]

                # Find the teacher's matiere
                matiere = db.query(Matiere).filter(
                    Matiere.enseignant_id == user.id,
                    Matiere.nom.ilike(f"%{matiere_nom}%")
                ).first()

                if not matiere:
                    # Let's search all classes taught by teacher to give suggestions
                    teacher_matieres = db.query(Matiere).filter(Matiere.enseignant_id == user.id).all()
                    suggestions = ", ".join([m.nom for m in teacher_matieres])
                    return {
                        "type": "text",
                        "content": f"Je n'ai pas trouvé de matière correspondant à '{matiere_nom}'. Vos matières enregistrées sont : {suggestions or 'Aucune'}. Veuillez préciser."
                    }

                date_absence = date.fromisoformat(date_absence_str)
                # Validation checks similar to Service:
                # 1. Past date check
                if date_absence < date.today():
                    return {
                        "type": "text",
                        "content": f"Vous ne pouvez pas déclarer d'absence pour une date passée ({date_absence_str})."
                    }

                # 2. Weekday course check
                day_index = date_absence.weekday()
                has_course = db.query(EmploiDuTemps).filter(
                    EmploiDuTemps.matiere_id == matiere.id,
                    EmploiDuTemps.jour_semaine == day_index
                ).first() is not None

                if not has_course:
                    return {
                        "type": "text",
                        "content": f"Vous n'avez aucun cours d'enregistré le {DAY_NAMES[day_index]} pour la matière '{matiere.nom}'. Vous ne pouvez donc pas déclarer d'absence pour ce jour."
                    }

                # 3. Duplicate check
                existing = db.query(Absence).filter(
                    Absence.enseignant_id == user.id,
                    Absence.matiere_id == matiere.id,
                    Absence.date_absence == date_absence,
                    Absence.statut != StatutAbsence.REJETE
                ).first()
                if existing:
                    return {
                        "type": "text",
                        "content": f"Vous avez déjà une absence déclarée pour '{matiere.nom}' le {date_absence_str}."
                    }

                # If all checks pass, request confirmation
                date_french = date_absence.strftime("%d/%m/%Y")
                return {
                    "type": "confirmation",
                    "content": f"Confirmez-vous la déclaration d'absence pour le cours de **{matiere.nom}** le **{date_french}** pour le motif suivant : *{motif}* ?",
                    "action_data": {
                        "action": "declare_absence",
                        "params": {
                            "matiere_id": matiere.id,
                            "date_absence": date_absence_str,
                            "motif": motif
                        }
                    }
                }

            elif name == "propose_rattrapage":
                date_proposee_str = args["date_proposee"]
                heure_debut_str = args["heure_debut"]
                heure_fin_str = args["heure_fin"]
                salle_nom = args["salle_nom"]
                absence_id = args.get("absence_id")

                # Resolve Salle
                salle = db.query(Salle).filter(Salle.nom.ilike(f"%{salle_nom}%")).first()
                if not salle:
                    return {
                        "type": "text",
                        "content": f"La salle '{salle_nom}' n'existe pas. Veuillez utiliser une salle valide."
                    }

                # Resolve Absence
                absence = None
                if absence_id:
                    absence = db.query(Absence).filter(
                        Absence.id == int(absence_id),
                        Absence.enseignant_id == user.id
                    ).first()
                else:
                    # Guess by date_absence and matiere_nom
                    date_absence_str = args.get("date_absence")
                    matiere_nom = args.get("matiere_nom")
                    
                    query = db.query(Absence).options(joinedload(Absence.matiere)).filter(
                        Absence.enseignant_id == user.id,
                        Absence.statut == StatutAbsence.VALIDE
                    )
                    if date_absence_str:
                        query = query.filter(Absence.date_absence == date.fromisoformat(date_absence_str))
                    if matiere_nom:
                        query = query.join(Matiere).filter(Matiere.nom.ilike(f"%{matiere_nom}%"))
                        
                    absences = query.all()
                    if not absences:
                        return {
                            "type": "text",
                            "content": "Je n'ai trouvé aucune absence validée correspondante pour planifier un rattrapage. Les rattrapages ne peuvent être programmés que pour des absences déjà validées par l'administration."
                        }
                    elif len(absences) > 1:
                        # List options for user
                        options_text = "\n".join([f"- ID {ab.id} : {ab.matiere.nom} du {ab.date_absence.strftime('%d/%m/%Y')}" for ab in absences])
                        return {
                            "type": "text",
                            "content": f"J'ai trouvé plusieurs absences validées. Laquelle souhaitez-vous rattraper ? Veuillez spécifier l'ID ou la date exacte :\n{options_text}"
                        }
                    else:
                        absence = absences[0]

                if not absence:
                    return {
                        "type": "text",
                        "content": "Absence introuvable ou vous n'en êtes pas le propriétaire."
                    }

                if absence.statut != StatutAbsence.VALIDE:
                    return {
                        "type": "text",
                        "content": f"L'absence du {absence.date_absence.strftime('%d/%m/%Y')} (ID {absence.id}) doit d'abord être validée par l'administration avant de pouvoir proposer un rattrapage."
                    }

                # Parse times
                date_proposee = date.fromisoformat(date_proposee_str)
                heure_debut = time.fromisoformat(heure_debut_str)
                heure_fin = time.fromisoformat(heure_fin_str)

                # Validation checks
                if heure_debut >= heure_fin:
                    return {
                        "type": "text",
                        "content": "L'heure de début doit être strictement antérieure à l'heure de fin."
                    }

                if date_proposee <= absence.date_absence:
                    return {
                        "type": "text",
                        "content": f"La date du rattrapage ({date_proposee_str}) doit être postérieure à la date de l'absence ({absence.date_absence.isoformat()})."
                    }

                # Check for existing scheduled rattrapage for this absence
                existing = db.query(Rattrapage).filter(
                    Rattrapage.absence_id == absence.id,
                    Rattrapage.statut != StatutRattrapage.ANNULE
                ).first()
                if existing:
                    return {
                        "type": "text",
                        "content": f"Un rattrapage est déjà en cours ou planifié pour cette absence (ID {absence.id})."
                    }

                # Conflict checks
                conflict_msg = RattrapageService.check_conflicts(
                    db, salle.id, user.id, date_proposee, heure_debut, heure_fin
                )
                if conflict_msg:
                    return {
                        "type": "text",
                        "content": f"Conflit de planification détecté : {conflict_msg}."
                    }

                # All clean, prompt confirmation
                return {
                    "type": "confirmation",
                    "content": (
                        f"Confirmez-vous la proposition de rattrapage pour l'absence du **{absence.date_absence.strftime('%d/%m/%Y')}** "
                        f"({absence.matiere.nom}) ?\n"
                        f"Détails proposés : Le **{date_proposee.strftime('%d/%m/%Y')}** de **{heure_debut_str}** à **{heure_fin_str}** "
                        f"en salle **{salle.nom}**."
                    ),
                    "action_data": {
                        "action": "propose_rattrapage",
                        "params": {
                            "absence_id": absence.id,
                            "date_proposee": date_proposee_str,
                            "heure_debut": heure_debut_str,
                            "heure_fin": heure_fin_str,
                            "salle_id": salle.id
                        }
                    }
                }

        except Exception as e:
            return {
                "type": "text",
                "content": f"Une erreur s'est produite lors de la validation : {str(e)}"
            }

        return {
            "type": "text",
            "content": f"Action '{name}' non gérée."
        }

    @staticmethod
    def execute_confirmed_action(db: Session, user: Utilisateur, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a write/action database transaction once the user confirms from the UI.
        """
        if user.role != RoleUtilisateur.ENSEIGNANT:
            return {"success": False, "message": "Rôle non autorisé."}

        try:
            if action == "declare_absence":
                matiere_id = params["matiere_id"]
                date_absence = date.fromisoformat(params["date_absence"])
                motif = params["motif"]
                justificatif_path = params.get("justificatif_path")

                absence = AbsenceService.declare_absence(
                    db=db,
                    enseignant_id=user.id,
                    matiere_id=matiere_id,
                    date_absence=date_absence,
                    motif=motif,
                    justificatif_path=justificatif_path
                )
                return {
                    "success": True,
                    "message": f"Votre absence pour le cours du {date_absence.strftime('%d/%m/%Y')} a été déclarée avec succès et est en attente de validation."
                }

            elif action == "propose_rattrapage":
                data_in = RattrapageCreate(
                    absence_id=params["absence_id"],
                    date_proposee=date.fromisoformat(params["date_proposee"]),
                    heure_debut=time.fromisoformat(params["heure_debut"]),
                    heure_fin=time.fromisoformat(params["heure_fin"]),
                    salle_id=params["salle_id"]
                )
                
                rattrapage = RattrapageService.create(db=db, data=data_in, current_user_id=user.id)
                return {
                    "success": True,
                    "message": f"Le rattrapage a été proposé avec succès pour le {data_in.date_proposee.strftime('%d/%m/%Y')}."
                }

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Erreur lors de l'exécution : {str(e)}"}

        return {"success": False, "message": f"Action '{action}' inconnue."}

    @staticmethod
    def process_message(db: Session, user: Utilisateur, message: str, history: List[Dict[str, str]] = []) -> Dict[str, Any]:
        """
        Runs the conversational AI workflow:
        1. Formulates Groq query with tool declarations.
        2. If Groq decides to call a read-only tool, queries the DB, feeds the details back to Groq, and replies.
        3. If Groq decides to call an action tool, runs pre-validation and returns a confirmation state.
        4. Otherwise, returns a direct natural language response.
        """
        if not client:
            return {
                "type": "text",
                "content": "L'assistant IA n'est pas configuré. Veuillez définir la clé d'API GROQ_API_KEY dans votre fichier .env."
            }

        # Build message history
        messages = [{"role": "system", "content": ChatbotService.get_system_prompt(user)}]
        
        # Add limited chat history
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
            
        messages.append({"role": "user", "content": message})

        # Step 1: Call Groq with tool calling
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.0
            )
        except Exception as e:
            return {
                "type": "text",
                "content": f"Erreur de communication avec Groq API : {str(e)}"
            }

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            # We assume one tool call at a time for simpler flow
            tool_call = tool_calls[0]
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            # Check if it is an action or a query
            if name in ["declare_absence", "propose_rattrapage"]:
                # Action -> returns validation / confirmation request
                return ChatbotService.validate_action_tool(db, user, name, args)
            else:
                # Query -> executes, feeds results back to Groq, and returns final natural response
                query_result = ChatbotService.execute_query_tool(db, user, name, args)
                
                # Append tool call and result to messages
                messages.append(response_message)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": name,
                    "content": json.dumps(query_result)
                })

                # Let Groq synthesize response
                try:
                    final_response = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=messages
                    )
                    return {
                        "type": "text",
                        "content": final_response.choices[0].message.content
                    }
                except Exception as e:
                    return {
                        "type": "text",
                        "content": f"Erreur lors de la mise en forme de la réponse : {str(e)}"
                    }
        else:
            # Plain message response
            return {
                "type": "text",
                "content": response_message.content
            }
