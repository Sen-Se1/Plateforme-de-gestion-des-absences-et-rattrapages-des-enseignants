"""
Schémas Pydantic pour les Départements.
"""
from pydantic import BaseModel

class DepartementBase(BaseModel):
    nom: str

class DepartementPublic(DepartementBase):
    id: int
    class Config:
        from_attributes = True
