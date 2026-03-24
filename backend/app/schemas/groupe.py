"""
Schémas Pydantic pour les Groupes.
"""
from pydantic import BaseModel

class GroupeBase(BaseModel):
    nom: str

class GroupePublic(GroupeBase):
    id: int
    class Config:
        from_attributes = True
