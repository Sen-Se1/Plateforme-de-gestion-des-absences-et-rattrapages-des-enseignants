from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from datetime import date, datetime
from typing import List, Optional, Tuple, Dict
from app.models.absence import Absence
from app.models.matiere import Matiere
from app.models.emploi_du_temps import EmploiDuTemps
from app.models.enums import StatutAbsence, RoleUtilisateur
from app.schemas.absence import AbsenceCreate, AbsenceUpdate
from fastapi import HTTPException, status, UploadFile
from app.utils.upload import save_upload_file

class AbsenceService:
    @staticmethod
    def get_paginated(db: Session, query, page: int, per_page: int) -> Tuple[List[Absence], int]:
        total = query.count()
        items = query.offset((page - 1) * per_page).limit(per_page).all()
        return items, total

    @staticmethod
    def _teacher_owns_matiere(db: Session, enseignant_id: int, matiere_id: int):
        matiere = db.query(Matiere).filter(Matiere.id == matiere_id).first()
        if not matiere or matiere.enseignant_id != enseignant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cette matière ne vous appartient pas ou n'existe pas"
            )
        return matiere

    @staticmethod
    def _teacher_has_course_on_date(db: Session, enseignant_id: int, date_absence: date):
        # Python weekday: Mon=0, Sun=6
        day_index = date_absence.weekday()
        # Join with Matiere because EmploiDuTemps doesn't have indirect enseignant_id FK (it's through Matiere)
        has_course = db.query(EmploiDuTemps).join(Matiere).filter(
            Matiere.enseignant_id == enseignant_id,
            EmploiDuTemps.jour_semaine == day_index
        ).first() is not None
        
        if not has_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous n'avez aucun cours prévu pour ce jour, vous ne pouvez pas déclarer d'absence"
            )
        return True

    @staticmethod
    def list_absences(db: Session, role: RoleUtilisateur, user_id: int, page: int, per_page: int, statut: Optional[StatutAbsence] = None, date_absence: Optional[date] = None):
        query = db.query(Absence).options(joinedload(Absence.enseignant), joinedload(Absence.matiere))
        
        if role == RoleUtilisateur.ENSEIGNANT:
            query = query.filter(Absence.enseignant_id == user_id)
        
        if statut:
            query = query.filter(Absence.statut == statut)
        if date_absence:
            query = query.filter(Absence.date_absence == date_absence)
            
        return AbsenceService.get_paginated(db, query.order_by(Absence.created_at.desc()), page, per_page)

    @staticmethod
    def get_by_id(db: Session, id: int, user_id: int, role: RoleUtilisateur):
        absence = db.query(Absence).options(joinedload(Absence.enseignant), joinedload(Absence.matiere)).filter(Absence.id == id).first()
        if not absence:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Absence non trouvée")
        
        if role == RoleUtilisateur.ENSEIGNANT and absence.enseignant_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
            
        return absence

    @staticmethod
    def declare_absence(db: Session, enseignant_id: int, matiere_id: int, date_absence: date, motif: str, justificatif_file: Optional[UploadFile] = None):
        # 1. Ownership check
        AbsenceService._teacher_owns_matiere(db, enseignant_id, matiere_id)
        # 2. Daily schedule check
        AbsenceService._teacher_has_course_on_date(db, enseignant_id, date_absence)
        
        # 3. Past date validation
        if date_absence < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas déclarer une absence pour une date passée"
            )
        
        # 4. Duplicate absence check
        existing = db.query(Absence).filter(
            Absence.enseignant_id == enseignant_id,
            Absence.matiere_id == matiere_id,
            Absence.date_absence == date_absence,
            Absence.statut != StatutAbsence.REJETE
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous avez déjà déclaré une absence pour cette matière à cette date"
            )
        
        # 5. File upload (subdir="" because UPLOAD_DIR already points to the uploads folder)
        justificatif_path = None
        if justificatif_file:
            justificatif_path = save_upload_file(justificatif_file, subdir="")
            
        # 6. Create record
        db_item = Absence(
            enseignant_id=enseignant_id,
            matiere_id=matiere_id,
            date_absence=date_absence,
            motif=motif,
            justificatif=justificatif_path,
            statut=StatutAbsence.EN_ATTENTE
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def update_absence(db: Session, id: int, enseignant_id: int, data: AbsenceUpdate):
        absence = db.query(Absence).filter(Absence.id == id).first()
        if not absence:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Absence non trouvée")
        
        if absence.enseignant_id != enseignant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Propriétaire uniquement")
            
        if absence.statut != StatutAbsence.EN_ATTENTE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Impossible de modifier une absence déjà validée ou rejetée"
            )
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Re-validate if critical fields change
        if "matiere_id" in update_data:
            AbsenceService._teacher_owns_matiere(db, enseignant_id, update_data["matiere_id"])
        
        if "date_absence" in update_data:
            AbsenceService._teacher_has_course_on_date(db, enseignant_id, update_data["date_absence"])
            
        for key, value in update_data.items():
            setattr(absence, key, value)
            
        db.commit()
        db.refresh(absence)
        return absence

    @staticmethod
    def delete_absence(db: Session, id: int, enseignant_id: int):
        absence = db.query(Absence).filter(Absence.id == id).first()
        if not absence:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Absence non trouvée")
        
        if absence.enseignant_id != enseignant_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Propriétaire uniquement")
            
        if absence.statut != StatutAbsence.EN_ATTENTE:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Impossible de supprimer une absence déjà validée ou rejetée"
            )
            
        db.delete(absence)
        db.commit()
        return True

    @staticmethod
    def set_statut(db: Session, id: int, statut: StatutAbsence):
        absence = db.query(Absence).filter(Absence.id == id).first()
        if not absence:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Absence non trouvée")
            
        absence.statut = statut
        db.commit()
        db.refresh(absence)
        # In a real app, send notification here
        return absence

    @staticmethod
    def get_planning_conflicts(db: Session) -> List[Dict]:
        conflicts = []
        # Query overlaps in EmploiDuTemps
        # Overlap: same jour_semaine, same room AND overlapping time OR same teacher AND overlapping time
        
        # We perform self-join to find overlaps
        # (e1.jour_semaine == e2.jour_semaine) AND (e1.id < e2.id)
        # AND (e1.heure_debut < e2.heure_fin) AND (e2.heure_debut < e1.heure_fin)
        # AND (e1.salle_id == e2.salle_id OR e1.matiere.enseignant_id == e2.matiere.enseignant_id)
        
        from sqlalchemy import and_, or_
        from app.models.emploi_du_temps import EmploiDuTemps
        from app.models.matiere import Matiere
        
        # We need enseignant_id from Matiere
        E1 = db.query(EmploiDuTemps).join(Matiere, EmploiDuTemps.matiere_id == Matiere.id).subquery()
        E2 = db.query(EmploiDuTemps).join(Matiere, EmploiDuTemps.matiere_id == Matiere.id).subquery()
        
        # This might be slow if there are many sessions, but it's a common planning check
        # Using a direct select statement for better readability/performance
        candidates = db.query(EmploiDuTemps).options(joinedload(EmploiDuTemps.matiere), joinedload(EmploiDuTemps.salle)).all()
        
        for i in range(len(candidates)):
            for j in range(i + 1, len(candidates)):
                e1 = candidates[i]
                e2 = candidates[j]
                
                if e1.jour_semaine == e2.jour_semaine:
                    # Overlap logic
                    if e1.heure_debut < e2.heure_fin and e2.heure_debut < e1.heure_fin:
                        # Conflict room
                        if e1.salle_id == e2.salle_id:
                            conflicts.append({
                                "type": "room",
                                "id1": e1.id,
                                "id2": e2.id,
                                "name1": e1.matiere.nom if e1.matiere else "?",
                                "name2": e2.matiere.nom if e2.matiere else "?",
                                "salle": e1.salle.nom if e1.salle else str(e1.salle_id),
                                "day": e1.jour_semaine,
                                "slot": f"{e1.heure_debut.strftime('%H:%M')} - {e1.heure_fin.strftime('%H:%M')} / {e2.heure_debut.strftime('%H:%M')} - {e2.heure_fin.strftime('%H:%M')}"
                            })
                        
                        # Conflict teacher
                        if e1.matiere and e2.matiere and e1.matiere.enseignant_id == e2.matiere.enseignant_id:
                            conflicts.append({
                                "type": "teacher",
                                "id1": e1.id,
                                "id2": e2.id,
                                "name1": e1.matiere.nom,
                                "name2": e2.matiere.nom,
                                "enseignant_id": e1.matiere.enseignant_id,
                                "day": e1.jour_semaine,
                                "slot": f"{e1.heure_debut.strftime('%H:%M')} - {e1.heure_fin.strftime('%H:%M')} / {e2.heure_debut.strftime('%H:%M')} - {e2.heure_fin.strftime('%H:%M')}"
                            })
                            
        return conflicts
