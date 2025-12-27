from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.v1 import deps
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyResponse
from app.services.ai_generator import generate_property_listing

router = APIRouter()

@router.get("/", response_model=List[PropertyResponse])
def read_properties(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user) # <--- PROTEGIDO
):
    # Solo traemos las propiedades DEL USUARIO ACTUAL
    properties = db.query(Property)\
        .filter(Property.owner_id == current_user.id)\
        .order_by(Property.id.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return properties

@router.post("/generate", response_model=PropertyResponse)
def create_property_and_generate(
    prop: PropertyCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user) # <--- PROTEGIDO
):
    # 1. Llamar a Gemini
    ai_content = generate_property_listing(
        features=prop.features,
        vibe=prop.vibe,
        address=prop.address
    )
    
    # 2. Guardar usando el ID del usuario logueado
    db_property = Property(
        address=prop.address,
        features=prop.features,
        vibe=prop.vibe,
        generated_content=ai_content,
        owner_id=current_user.id # <--- ID REAL
    )
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    return db_property