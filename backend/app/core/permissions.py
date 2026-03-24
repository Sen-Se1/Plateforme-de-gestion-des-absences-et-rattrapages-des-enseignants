from typing import List, Callable
from fastapi import Depends, HTTPException, status
from app.models.utilisateur import Utilisateur
from app.api.deps import get_current_active_user
from app.utils.enums import RoleUtilisateur

def require_roles(allowed_roles: List[RoleUtilisateur]) -> Callable:
    """
    Dépendance pour restreindre l'accès en fonction des rôles.
    """
    def role_checker(current_user: Utilisateur = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
            )
        return current_user
    return role_checker
