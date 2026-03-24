from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenResponse, ChangePasswordRequest
from app.schemas.utilisateur import UtilisateurPublic
from app.models.utilisateur import Utilisateur

router = APIRouter()

@router.post("/connexion", response_model=TokenResponse)
async def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Point de connexion pour obtenir un token JWT.
    (Squelette à implémenter)
    """
    return {"message": "Squelette de connexion"}

@router.get("/me", response_model=UtilisateurPublic)
async def get_me(current_user: Utilisateur = Depends(get_current_user)):
    """
    Récupère les informations de l'utilisateur connecté.
    """
    return current_user

@router.patch("/changer-mot-de-passe")
async def change_password(
    data: ChangePasswordRequest,
    current_user: Utilisateur = Depends(get_current_user)
):
    """
    Change le mot de passe de l'utilisateur.
    (Squelette à implémenter)
    """
    return {"message": "Changement de mot de passe à implémenter"}
