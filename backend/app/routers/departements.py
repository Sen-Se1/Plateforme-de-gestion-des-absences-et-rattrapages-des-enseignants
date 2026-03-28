from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.utilisateur import Utilisateur
from app.models.enums import RoleUtilisateur
from app.schemas.departement import DepartementCreate, DepartementUpdate, DepartementResponse
from app.services.departement_service import DepartementService

router = APIRouter()

@router.get("/", response_model=List[DepartementResponse])
def get_departements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role not in [RoleUtilisateur.ADMIN_SYSTEME, RoleUtilisateur.ADMINISTRATION]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Pas assez d'autorisations pour lister les départements"
        )
    return DepartementService.get_all(db, skip=skip, limit=limit, search=search)

@router.post("/", response_model=DepartementResponse, status_code=status.HTTP_201_CREATED)
def create_departement(
    data: DepartementCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role != RoleUtilisateur.ADMIN_SYSTEME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Seul l'administrateur système peut créer des départements"
        )
    return DepartementService.create(db, data)

@router.put("/{departement_id}", response_model=DepartementResponse)
def update_departement(
    departement_id: int,
    data: DepartementUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role != RoleUtilisateur.ADMIN_SYSTEME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Seul l'administrateur système peut modifier des départements"
        )
        
    departement = DepartementService.update(db, departement_id, data)
    if not departement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Département non trouvé"
        )
    return departement

@router.delete("/{departement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_departement(
    departement_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_active_user)
):
    if current_user.role != RoleUtilisateur.ADMIN_SYSTEME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Seul l'administrateur système peut supprimer des départements"
        )

    if DepartementService.has_references(db, departement_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Impossible de supprimer un département contenant des groupes ou des matières"
        )
        
    success = DepartementService.delete(db, departement_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Département non trouvé"
        )
    return None
