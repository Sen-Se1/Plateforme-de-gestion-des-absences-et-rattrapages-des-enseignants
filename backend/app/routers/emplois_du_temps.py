from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.utilisateur import Utilisateur
from app.models.enums import RoleUtilisateur
from app.schemas.emploi_du_temps import EmploiDuTempsCreate, EmploiDuTempsUpdate, EmploiDuTempsResponse
from app.schemas.common import PaginatedResponse
from app.services.emploi_du_temps_service import EmploiDuTempsService, ConflictError
from app.services.groupe_service import GroupeService  # Assuming this exists for membership check

router = APIRouter()

def check_group_membership(db: Session, user: Utilisateur, groupe_id: int):
    if user.role == RoleUtilisateur.ETUDIANT:
        from app.models.etudiant_groupe import etudiants_groupes
        is_member = db.query(etudiants_groupes).filter(
            etudiants_groupes.c.etudiant_id == user.id,
            etudiants_groupes.c.groupe_id == groupe_id
        ).first() is not None
        if not is_member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous n'êtes pas membre de ce groupe")

@router.get("/groupe/{groupe_id}", response_model=PaginatedResponse[EmploiDuTempsResponse])
def get_by_groupe(
    groupe_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    jour_semaine: Optional[int] = Query(None, ge=0, le=6),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION, RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ETUDIANT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    check_group_membership(db, current_user, groupe_id)
    
    items, total = EmploiDuTempsService.get_by_groupe(db, groupe_id, page, per_page, jour_semaine)
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/etudiant", response_model=PaginatedResponse[EmploiDuTempsResponse])
def get_for_logged_in_etudiant(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    jour_semaine: Optional[int] = Query(None, ge=0, le=6),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role != RoleUtilisateur.ETUDIANT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé aux étudiants")
    
    items, total = EmploiDuTempsService.get_by_etudiant(db, current_user.id, page, per_page, jour_semaine)
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/enseignant", response_model=PaginatedResponse[EmploiDuTempsResponse])
def get_for_logged_in_enseignant(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    jour_semaine: Optional[int] = Query(None, ge=0, le=6),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role != RoleUtilisateur.ENSEIGNANT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé aux enseignants")
    
    items, total = EmploiDuTempsService.get_by_enseignant(db, current_user.id, page, per_page, jour_semaine)
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/salle/{salle_id}", response_model=PaginatedResponse[EmploiDuTempsResponse])
def get_by_salle(
    salle_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    jour_semaine: Optional[int] = Query(None, ge=0, le=6),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    items, total = EmploiDuTempsService.get_by_salle(db, salle_id, page, per_page, jour_semaine)
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/matiere/{matiere_id}", response_model=PaginatedResponse[EmploiDuTempsResponse])
def get_by_matiere(
    matiere_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    jour_semaine: Optional[int] = Query(None, ge=0, le=6),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION, RoleUtilisateur.ENSEIGNANT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    items, total = EmploiDuTempsService.get_by_matiere(db, matiere_id, page, per_page, jour_semaine)
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/conflits-planning")
def get_planning_conflicts(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
        
    return EmploiDuTempsService.get_planning_conflicts(db)

@router.post("/", response_model=EmploiDuTempsResponse, status_code=status.HTTP_201_CREATED)
def create_emploi_du_temps(
    data: EmploiDuTempsCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    if data.heure_debut >= data.heure_fin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="L'heure de début doit être avant l'heure de fin")

    try:
        return EmploiDuTempsService.create(db, data)
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Scheduling conflict", 
                "conflicts": [c["details"] for c in e.conflicts]
            }
        )

@router.put("/{id}", response_model=EmploiDuTempsResponse)
def update_emploi_du_temps(
    id: int,
    data: EmploiDuTempsUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    if data.heure_debut and data.heure_fin and data.heure_debut >= data.heure_fin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="L'heure de début doit être avant l'heure de fin")
        
    try:
        updated = EmploiDuTempsService.update(db, id, data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cours non trouvé")
        return updated
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Scheduling conflict", 
                "conflicts": [c["details"] for c in e.conflicts]
            }
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_emploi_du_temps(
    id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pas assez d'autorisations")
    
    EmploiDuTempsService.delete(db, id)
    return None
