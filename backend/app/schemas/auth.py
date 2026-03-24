from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    """Schéma de requête pour la connexion."""
    email: EmailStr
    mot_de_passe: str

class TokenResponse(BaseModel):
    """Schéma de réponse après réussite de connexion."""
    access_token: str
    token_type: str = "bearer"

class ChangePasswordRequest(BaseModel):
    """Schéma pour le changement de mot de passe."""
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str
