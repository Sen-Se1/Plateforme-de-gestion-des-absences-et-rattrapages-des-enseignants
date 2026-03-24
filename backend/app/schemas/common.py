from pydantic import BaseModel

class MessageResponse(BaseModel):
    """Schéma de réponse simple contenant uniquement un message."""
    message: str

class HealthResponse(BaseModel):
    """Schéma de réponse pour l'état de santé du service."""
    status: str
    version: str
