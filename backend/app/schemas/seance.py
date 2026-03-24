"""
Schémas Pydantic pour les Séances.
"""
from pydantic import BaseModel
from datetime import datetime
from app.utils.enums import StatutSeance

class SeanceBase(BaseModel):
    date_heure_debut: datetime
    date_heure_fin: datetime
    statut: StatutSeance

class SeancePublic(SeanceBase):
    id: int
    class Config:
        from_attributes = True
