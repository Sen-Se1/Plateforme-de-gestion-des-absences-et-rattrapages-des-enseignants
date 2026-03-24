"""
Schémas Pydantic pour les Matières.
"""
from pydantic import BaseModel

class MatiereBase(BaseModel):
    nom: str
    code: str

class MatierePublic(MatiereBase):
    id: int
    class Config:
        from_attributes = True
