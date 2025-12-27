from google import genai
from app.core.config import settings

def generate_property_listing(features: str, vibe: str, address: str) -> str:
    """
    Genera un texto de venta inmobiliaria usando el SDK moderno de Google Gen AI.
    """
    if not settings.GOOGLE_API_KEY:
        return "ERROR: Google API Key no configurada en el .env"

    try:
        # 1. Inicializamos el cliente
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        prompt = f"""
        Actúa como un copywriter inmobiliario experto de Argentina.
        
        Objeto: Vender esta propiedad.
        - Ubicación: {address}
        - Características: {features}
        - Vibe: {vibe}
        
        Salida: 
        - Un Título con emojis.
        - Descripción para Portales (Zonaprop).
        - Copy para Instagram (con hashtags).
        """

        # 2. SELECCIÓN SEGURA: Usamos el alias 'gemini-flash-latest'
        # Este apareció en tu lista de diagnóstico y suele ser el "Free Tier" real.
        response = client.models.generate_content(
            model='gemini-flash-latest', 
            contents=prompt
        )
        
        return response.text

    except Exception as e:
        # Si este también falla, es probable que la API Key necesite un proyecto nuevo 
        # en Google Cloud Console desde cero, pero probemos este alias primero.
        return f"⚠️ Error de IA: {str(e)}"