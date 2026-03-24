from pydantic import BaseModel, EmailStr
from app.utils.enums import RoleUtilisateur

class UtilisateurBase(BaseModel):
    nom_complet: str
    email: EmailStr
    role: RoleUtilisateur
    actif: bool = True

class UtilisateurPublic(BaseModel):
    """Schéma pour l'affichage public d'un utilisateur."""
    id: int
    nom_complet: str
    email: EmailStr
    role: RoleUtilisateur
    actif: bool

    class Config:
        from_attributes = True
