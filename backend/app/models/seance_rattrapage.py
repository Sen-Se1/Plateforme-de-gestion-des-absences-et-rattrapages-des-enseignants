"""
Module modèle pour les Séances de Rattrapage.
"""
from sqlalchemy import Column, Integer, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import StatutSeanceRattrapage

class SeanceRattrapage(Base, TimestampMixin):
    __tablename__ = "seances_rattrapage"
    id = Column(Integer, primary_key=True, index=True)
    statut = Column(SQLEnum(StatutSeanceRattrapage), default=StatutSeanceRattrapage.PLANIFIEE)
    # TODO: Ajouter clés étrangères et relations
