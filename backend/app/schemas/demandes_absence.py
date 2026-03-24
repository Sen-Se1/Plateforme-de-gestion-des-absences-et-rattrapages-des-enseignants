"""
Schémas Pydantic pour les Demandes d'Absence.
"""
from pydantic import BaseModel
from app.utils.enums import StatutDemandeAbsence

class DemandeAbsenceBase(BaseModel):
    motif: str
    statut: StatutDemandeAbsence

class DemandeAbsencePublic(DemandeAbsenceBase):
    id: int
    class Config:
        from_attributes = True
