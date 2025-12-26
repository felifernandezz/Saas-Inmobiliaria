import google.generativeai as genai
from app.core.config import settings

# Configuramos la API una sola vez
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

def generate_property_listing(features: str, vibe: str, address: str) -> str:
    """
    Genera un texto de venta inmobiliaria usando Gemini.
    """
    if not settings.GOOGLE_API_KEY:
        return "ERROR: Google API Key no configurada. Revisa tu .env"

    # Lista de modelos a probar (del más económico/estable al más nuevo)
    candidate_models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash']

    prompt = f"""
    Actúa como un copywriter inmobiliario experto de Argentina.
    
    Objeto: Vender esta propiedad.
    - Ubicación: {address}
    - Características: {features}
    - Vibe: {vibe}
    
    Salida: Título con emojis, Descripción para Portales, Copy para Instagram.
    """

    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Fallo con {model_name}: {str(e)}")
            continue

    # Si todo falla, devolvemos un mock para no trabar el desarrollo
    return """
    ⚠️ No se pudo generar el contenido con la IA (Error de Cuota o Modelo no encontrado).
    
    Título: ¡Oportunidad en {address}! 🏡
    
    Descripción: Esta propiedad cuenta con {features}. Es ideal para quienes buscan un estilo {vibe}. contáctanos para más info.
    
    (Este es un texto generado automáticamente por el sistema de fallback debido a errores en la API de Gemini).
    """