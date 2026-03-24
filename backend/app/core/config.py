from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Configuration globale de l'application via Pydantic Settings.
    """
    # Application attributes
    APP_NAME: str = "Gestion Absences & Rattrapages"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "API pour la gestion des absences et des rattrapages."
    API_PREFIX: str = "/api/v1"

    # Database connection
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"

    # Security
    JWT_SECRET_KEY: str = "top-secret-key-change-it"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
