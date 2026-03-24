"""
Module modèle pour les Séances.
"""
from sqlalchemy import Column, Integer, DateTime, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import StatutSeance

class Seance(Base, TimestampMixin):
    __tablename__ = "seances"
    id = Column(Integer, primary_key=True, index=True)
    date_heure_debut = Column(DateTime, nullable=False)
    date_heure_fin = Column(DateTime, nullable=False)
    statut = Column(SQLEnum(StatutSeance), default=StatutSeance.PLANIFIEE)
    # TODO: Ajouter clés étrangères et relations
