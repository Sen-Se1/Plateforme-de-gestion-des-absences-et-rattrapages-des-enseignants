from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func

# Classe de base pour tous les modèles
Base = declarative_base()

class TimestampMixin:
    """
    Mixin pour ajouter automatiquement les colonnes 'created_at' et 'updated_at' aux modèles.
    """
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
