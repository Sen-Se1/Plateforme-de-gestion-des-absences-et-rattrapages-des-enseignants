from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel, Field, ConfigDict

class EmploiDuTempsBase(BaseModel):
    groupe_id: int
    matiere_id: int
    salle_id: int
    jour_semaine: int = Field(..., ge=0, le=6, description="0=Lundi, 1=Mardi, ..., 6=Dimanche")
    heure_debut: time
    heure_fin: time

class EmploiDuTempsCreate(EmploiDuTempsBase):
    pass

class EmploiDuTempsUpdate(BaseModel):
    groupe_id: Optional[int] = None
    matiere_id: Optional[int] = None
    salle_id: Optional[int] = None
    jour_semaine: Optional[int] = Field(None, ge=0, le=6)
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None

class EmploiDuTempsResponse(EmploiDuTempsBase):
    id: int
    rattrapage_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class EmploiDuTempsSimple(EmploiDuTempsBase):
    id: int
    rattrapage_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
