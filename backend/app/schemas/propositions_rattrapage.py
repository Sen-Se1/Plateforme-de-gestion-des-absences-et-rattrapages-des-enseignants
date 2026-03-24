"""
Schémas Pydantic pour les Propositions de Rattrapage.
"""
from pydantic import BaseModel
from app.utils.enums import StatutPropositionRattrapage

class PropositionRattrapageBase(BaseModel):
    commentaire: str
    statut: StatutPropositionRattrapage

class PropositionRattrapagePublic(PropositionRattrapageBase):
    id: int
    class Config:
        from_attributes = True
