from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.enums import StatutAbsence
from app.schemas.utilisateur import UtilisateurSimple
from app.schemas.matiere import MatiereSimple

class AbsenceBase(BaseModel):
    enseignant_id: int
    matiere_id: int
    date_absence: date
    motif: str = Field(...)
    justificatif: Optional[str] = Field(None, max_length=255)

class AbsenceCreate(AbsenceBase):
    statut: Optional[StatutAbsence] = StatutAbsence.EN_ATTENTE

class AbsenceUpdate(BaseModel):
    enseignant_id: Optional[int] = None
    matiere_id: Optional[int] = None
    date_absence: Optional[date] = None
    motif: Optional[str] = None
    justificatif: Optional[str] = Field(None, max_length=255)
    statut: Optional[StatutAbsence] = None

class AbsenceSimple(AbsenceBase):
    id: int
    statut: StatutAbsence
    model_config = ConfigDict(from_attributes=True)

class AbsenceResponse(AbsenceBase):
    id: int
    statut: StatutAbsence
    enseignant: Optional[UtilisateurSimple] = None
    matiere: Optional[MatiereSimple] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
