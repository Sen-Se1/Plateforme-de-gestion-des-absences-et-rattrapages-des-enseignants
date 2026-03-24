"""
Module modèle pour les Départements.
"""
from sqlalchemy import Column, Integer, String
from app.db.base import Base, TimestampMixin

class Departement(Base, TimestampMixin):
    __tablename__ = "departements"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    # TODO: Ajouter relations
