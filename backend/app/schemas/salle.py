"""
Schémas Pydantic pour les Salles.
"""
from pydantic import BaseModel

class SalleBase(BaseModel):
    nom: str

class SallePublic(SalleBase):
    id: int
    class Config:
        from_attributes = True
