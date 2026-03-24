from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import oauth2_scheme
from app.db.session import get_db
from app.models.utilisateur import Utilisateur
from app.schemas.auth import TokenResponse

class TokenData(BaseModel):
    id: Optional[str] = None

from pydantic import BaseModel
from typing import Optional

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Utilisateur:
    """
    Récupère l'utilisateur actuel à partir du token JWT reçu.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les informations d'identification",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(Utilisateur).filter(Utilisateur.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: Utilisateur = Depends(get_current_user)
) -> Utilisateur:
    """
    Vérifie si l'utilisateur actuel est actif.
    """
    if not current_user.actif:
        raise HTTPException(status_code=400, detail="Utilisateur inactif")
    return current_user
