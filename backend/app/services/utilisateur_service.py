from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import UtilisateurCreate, UtilisateurUpdate
from app.core.security import get_password_hash

class UtilisateurService:
    @staticmethod
    def get_all(db: Session, role: Optional[str] = None, actif: Optional[bool] = None) -> List[Utilisateur]:
        query = db.query(Utilisateur)
        if role:
            query = query.filter(Utilisateur.role == role)
        if actif is not None:
            query = query.filter(Utilisateur.actif == actif)
        return query.all()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[Utilisateur]:
        return db.query(Utilisateur).filter(Utilisateur.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Utilisateur]:
        return db.query(Utilisateur).filter(Utilisateur.email == email).first()

    @staticmethod
    def create(db: Session, user_data: UtilisateurCreate) -> Utilisateur:
        hashed_password = get_password_hash(user_data.mot_de_passe)
        db_user = Utilisateur(
            nom=user_data.nom,
            prenom=user_data.prenom,
            email=user_data.email,
            mot_de_passe=hashed_password,
            role=user_data.role,
            actif=user_data.actif
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, user_id: int, user_data: UtilisateurUpdate) -> Optional[Utilisateur]:
        user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        if 'mot_de_passe' in update_data and update_data['mot_de_passe']:
            update_data['mot_de_passe'] = get_password_hash(update_data['mot_de_passe'])
        
        for key, value in update_data.items():
            setattr(user, key, value)
            
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def activate(db: Session, user_id: int) -> Optional[Utilisateur]:
        user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not user:
            return None
        user.actif = True
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def deactivate(db: Session, user_id: int) -> Optional[Utilisateur]:
        user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not user:
            return None
        user.actif = False
        db.commit()
        db.refresh(user)
        return user
