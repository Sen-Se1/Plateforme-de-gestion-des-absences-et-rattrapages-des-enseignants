from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.groupe import GroupeSimple
from app.schemas.matiere import MatiereSimple
from app.schemas.salle import SalleSimple
from app.schemas.rattrapage import RattrapageSimple

class EmploiDuTempsBase(BaseModel):
    groupe_id: int
    matiere_id: int
    salle_id: int
    date_cours: date
    heure_debut: time
    heure_fin: time
    rattrapage_id: Optional[int] = None

class EmploiDuTempsCreate(EmploiDuTempsBase):
    pass

class EmploiDuTempsUpdate(BaseModel):
    groupe_id: Optional[int] = None
    matiere_id: Optional[int] = None
    salle_id: Optional[int] = None
    date_cours: Optional[date] = None
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None
    rattrapage_id: Optional[int] = None

class EmploiDuTempsSimple(EmploiDuTempsBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class EmploiDuTempsResponse(EmploiDuTempsBase):
    id: int
    groupe: Optional[GroupeSimple] = None
    matiere: Optional[MatiereSimple] = None
    salle: Optional[SalleSimple] = None
    rattrapage: Optional[RattrapageSimple] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
