from typing import List
import json
from google import genai
from google.genai import types
from app.core.config import settings

def generate_property_listing(
    features: str, 
    vibe: str, 
    address: str, 
    images_data: List[tuple[bytes, str]] = None 
) -> str:
    if not settings.GOOGLE_API_KEY:
        return json.dumps({"error": "API Key faltante"})

    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        # PROMPT NUEVO: Específico para JSON
        prompt_text = f"""
        Actúa como un copywriter inmobiliario experto.
        Analiza los datos y las imágenes de esta propiedad en {address}.
        
        Datos: {features}
        Estilo: {vibe}
        
        IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido. 
        NO incluyas texto antes ni después del JSON. 
        NO uses bloques de código ```json.
        
        El JSON debe tener esta estructura exacta:
        {{
            "title": "Un título corto y vendedor con un solo emoji al final",
            "short_description": "Un resumen de 2 líneas para la bajada",
            "full_description": "La descripción completa para portales (sin usar símbolos markdown como ** o ##, solo texto plano y párrafos)",
            "highlights": ["Punto fuerte 1", "Punto fuerte 2", "Punto fuerte 3", "Punto fuerte 4"],
            "instagram_copy": "El texto para redes sociales con hashtags"
        }}
        """

        contents = [prompt_text]
        
        if images_data:
            for img_bytes, img_mime in images_data:
                contents.append(
                    types.Part.from_bytes(
                        data=img_bytes,
                        mime_type=img_mime or "image/jpeg"
                    )
                )

        # Configuramos para que la respuesta sea JSON (si el modelo lo soporta nativo)
        # o confiamos en el prompt estricto para modelos flash-latest.
        response = client.models.generate_content(
            model='gemini-flash-latest', 
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json" # Forzamos modo JSON
            )
        )
        
        return response.text

    except Exception as e:
        # En caso de error, devolvemos un JSON de error para que el front no rompa
        return json.dumps({
            "title": "Error generando contenido",
            "short_description": str(e),
            "full_description": "Intenta de nuevo.",
            "highlights": [],
            "instagram_copy": ""
        })