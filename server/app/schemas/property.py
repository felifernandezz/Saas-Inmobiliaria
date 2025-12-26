from pydantic import BaseModel
from typing import Optional

# Lo que recibimos del usuario (Frontend)
class PropertyCreate(BaseModel):
    address: str
    features: str  # Ej: "100m2, 3 amb, balcón"
    vibe: str      # Ej: "Familiar, Lujo, Oportunidad"

# Lo que devolvemos al usuario (Respuesta)
class PropertyResponse(PropertyCreate):
    id: int
    generated_content: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True