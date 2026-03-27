from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.utilisateur import UtilisateurSimple

class NotificationBase(BaseModel):
    utilisateur_id: int
    titre: str = Field(..., max_length=200)
    message: str = Field(...)
    est_lu: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    est_lu: Optional[bool] = None

class NotificationSimple(NotificationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(NotificationBase):
    id: int
    utilisateur: Optional[UtilisateurSimple] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
