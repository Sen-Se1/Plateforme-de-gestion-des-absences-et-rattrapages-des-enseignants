"""
Schémas Pydantic pour les Séances de Rattrapage.
"""
from pydantic import BaseModel
from app.utils.enums import StatutSeanceRattrapage

class SeanceRattrapageBase(BaseModel):
    statut: StatutSeanceRattrapage

class SeanceRattrapagePublic(SeanceRattrapageBase):
    id: int
    class Config:
        from_attributes = True
