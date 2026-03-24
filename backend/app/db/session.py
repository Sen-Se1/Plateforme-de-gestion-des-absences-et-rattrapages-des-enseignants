from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from typing import Generator

# Création du moteur SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping=True est utile pour éviter les erreurs de connexion expirée
    pool_pre_ping=True
)

# Fabrique de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dépendance pour injecter la session de base de données dans les routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
