"""
Module modèle pour les Propositions de Rattrapage.
"""
from sqlalchemy import Column, Integer, Text, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import StatutPropositionRattrapage

class PropositionRattrapage(Base, TimestampMixin):
    __tablename__ = "propositions_rattrapage"
    id = Column(Integer, primary_key=True, index=True)
    commentaire = Column(Text)
    statut = Column(SQLEnum(StatutPropositionRattrapage), default=StatutPropositionRattrapage.EN_ATTENTE)
    # TODO: Ajouter clés étrangères et relations
