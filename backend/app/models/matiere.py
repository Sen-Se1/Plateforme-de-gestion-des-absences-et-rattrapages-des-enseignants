"""
Module modèle pour les Matières.
"""
from sqlalchemy import Column, Integer, String
from app.db.base import Base, TimestampMixin

class Matiere(Base, TimestampMixin):
    __tablename__ = "matieres"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    # TODO: Ajouter relations
