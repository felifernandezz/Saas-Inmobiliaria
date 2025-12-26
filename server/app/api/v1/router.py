from fastapi import APIRouter
from app.api.v1 import properties

api_router = APIRouter()

# Aquí conectamos el archivo que acabamos de crear
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])