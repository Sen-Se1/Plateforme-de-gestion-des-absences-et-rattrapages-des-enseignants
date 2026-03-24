"""
Module modèle pour les Notifications.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Enum as SQLEnum
from app.db.base import Base, TimestampMixin
from app.utils.enums import TypeNotification

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    lu = Column(Boolean, default=False)
    type = Column(SQLEnum(TypeNotification), default=TypeNotification.INFO)
    # TODO: Ajouter clés étrangères et relations
