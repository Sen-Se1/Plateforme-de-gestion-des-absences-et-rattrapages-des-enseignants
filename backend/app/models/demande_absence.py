"""
Module modèle pour les Demandes d'Absence.
"""
from sqlalchemy import Column, Integer, String, Text, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import StatutDemandeAbsence

class DemandeAbsence(Base, TimestampMixin):
    __tablename__ = "demandes_absence"
    id = Column(Integer, primary_key=True, index=True)
    motif = Column(Text, nullable=False)
    statut = Column(SQLEnum(StatutDemandeAbsence), default=StatutDemandeAbsence.EN_ATTENTE)
    # TODO: Ajouter clés étrangères et relations
