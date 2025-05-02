# backend/app/utils/aisg_api.py

import os
import requests
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

def login_aisg():
    """Realiza login contra el API de AISG y retorna el token o respuesta completa."""
    url = os.getenv("AISG_API_BASE_URL") + os.getenv("AISG_API_LOGIN_ENDPOINT")
    payload = {
        "email": os.getenv("AISG_API_EMAIL"),
        "password": os.getenv("AISG_API_PASSWORD")
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()  # Puedes extraer el token si lo deseas con ['token']
    except requests.RequestException as e:
        print("Error al hacer login en AISG:", e)
        return None