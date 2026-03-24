"""
Module modèle pour les Groupes.
"""
from sqlalchemy import Column, Integer, String
from app.db.base import Base, TimestampMixin

class Groupe(Base, TimestampMixin):
    __tablename__ = "groupes"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    # TODO: Ajouter relations
