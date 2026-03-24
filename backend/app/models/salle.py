"""
Module modèle pour les Salles.
"""
from sqlalchemy import Column, Integer, String
from app.db.base import Base, TimestampMixin

class Salle(Base, TimestampMixin):
    __tablename__ = "salles"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    # TODO: Ajouter relations
