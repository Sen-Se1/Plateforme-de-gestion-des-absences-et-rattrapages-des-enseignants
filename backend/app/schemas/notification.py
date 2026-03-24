"""
Schémas Pydantic pour les Notifications.
"""
from pydantic import BaseModel
from app.utils.enums import TypeNotification

class NotificationBase(BaseModel):
    titre: str
    message: str
    type: TypeNotification

class NotificationPublic(NotificationBase):
    id: int
    lu: bool
    class Config:
        from_attributes = True
