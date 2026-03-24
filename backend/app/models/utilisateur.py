from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import RoleUtilisateur

class Utilisateur(Base, TimestampMixin):
    """
    Modèle représentant un utilisateur dans le système.
    """
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom_complet = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)
    role = Column(SQLEnum(RoleUtilisateur), nullable=False, default=RoleUtilisateur.ETUDIANT)
    actif = Column(Boolean, default=True)
