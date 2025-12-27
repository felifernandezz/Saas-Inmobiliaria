from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyResponse
from app.services.ai_generator import generate_property_listing
from typing import List

router = APIRouter()

# Dependencia para obtener la BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[PropertyResponse])
def read_properties(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Traemos las propiedades del usuario (hardcodeado ID 1 por ahora)
    # Ordenadas por ID descendente (las nuevas primero)
    properties = db.query(Property)\
        .filter(Property.owner_id == 1)\
        .order_by(Property.id.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return properties        

@router.post("/generate", response_model=PropertyResponse)
def create_property_and_generate(
    prop: PropertyCreate, 
    db: Session = Depends(get_db)
):
    # 1. Llamar a Gemini
    ai_content = generate_property_listing(
        features=prop.features,
        vibe=prop.vibe,
        address=prop.address
    )
    
    # 2. Guardar en Base de Datos (Simulamos un owner_id=1 temporalmente)
    db_property = Property(
        address=prop.address,
        features=prop.features, # En el futuro guardaremos el JSON
        vibe=prop.vibe,
        generated_content=ai_content,
        owner_id=1 # HARDCODED TEMPORALMENTE (hasta que hagamos el login)
    )
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    # Devolvemos el esquema Pydantic explícitamente porque 'vibe' no está en la BD
    return PropertyResponse(
        id=db_property.id,
        address=db_property.address,
        features=db_property.features,
        vibe=prop.vibe, 
        generated_content=db_property.generated_content,
        owner_id=db_property.owner_id
    )