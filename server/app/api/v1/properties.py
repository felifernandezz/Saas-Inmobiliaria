from typing import List
from fastapi import APIRouter, Depends, Form, File, UploadFile
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
async def create_property_and_generate(
    address: str = Form(...),
    features: str = Form(...),
    vibe: str = Form(...),
    images: List[UploadFile] = File(None), # <--- AHORA ES UNA LISTA
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 1. Leemos todas las imágenes
    processed_images = []
    if images:
        for img in images:
            # Importante: leer los bytes de cada una
            img_bytes = await img.read()
            processed_images.append((img_bytes, img.content_type))

    # 2. Llamar a Gemini con la lista
    ai_content = generate_property_listing(
        features=features,
        vibe=vibe,
        address=address,
        images_data=processed_images # <--- Pasamos la lista
    )
    
    # 3. Guardar en BD (sin guardar las fotos por ahora para no llenar el disco)
    db_property = Property(
        address=address,
        features=features,
        vibe=vibe,
        generated_content=ai_content,
        owner_id=current_user.id
    )
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    return db_property