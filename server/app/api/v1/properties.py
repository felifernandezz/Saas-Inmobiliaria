from typing import List
from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from app.api.v1 import deps
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyResponse
from app.services.ai_generator import generate_property_listing
from app.services.video_generator import create_real_estate_video
from fastapi.responses import FileResponse
from fastapi import BackgroundTasks
import os
import shutil
import uuid

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

@router.post("/generate-video")
async def generate_video_endpoint(
    background_tasks: BackgroundTasks,
    text_info: str = Form(""),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(deps.get_current_user)
):
    # Crear directorio temporal único para este request
    request_id = str(uuid.uuid4())
    temp_dir = f"temp_{request_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    saved_paths = []
    
    try:
        # Guardar imágenes
        for img in images:
            file_path = os.path.join(temp_dir, img.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(img.file, buffer)
            saved_paths.append(file_path)
            
        # Generar video
        output_filename = os.path.join(temp_dir, "output_video.mp4")
        
        # Llamar al servicio (ejecución síncrona/bloqueante por ahora, 
        # idealmente esto iría a una cola de tareas si fuera muy pesado)
        video_path = create_real_estate_video(
            image_paths=saved_paths,
            text_info=text_info,
            output_filename=output_filename
        )
        
        # Función de limpieza
        def cleanup():
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Error cleaning up {temp_dir}: {e}")

        # Añadir limpieza tras la respuesta
        background_tasks.add_task(cleanup)
        
        return FileResponse(
            video_path, 
            media_type="video/mp4", 
            filename=f"video_{request_id}.mp4"
        )
        
    except Exception as e:
        # En caso de error, limpiar inmediatamente
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise e