import os
import json
import boto3
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Cognito
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
CLIENT_ID = os.getenv("COGNITO_TOKEN")  # AppClientID
REGION = os.getenv("COGNITO_REGION", "us-east-1")

# Crear cliente de Cognito
cognito_client = boto3.client('cognito-idp', region_name=REGION)

def authenticate_cognito(username, password):
    """Autenticar usuario con Cognito y obtener tokens"""
    try:
        response = cognito_client.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            ClientId=CLIENT_ID,
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )
        
        # Extraer tokens
        auth_result = response.get('AuthenticationResult', {})
        id_token = auth_result.get('IdToken')
        refresh_token = auth_result.get('RefreshToken')
        expires_in = auth_result.get('ExpiresIn')
        
        print(f"✅ Autenticación exitosa para usuario: {username}")
        print(f"⏱️ Token expira en: {expires_in} segundos")
        
        return {
            "id_token": id_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in
        }
    except Exception as e:
        print(f"❌ Error en autenticación: {str(e)}")
        return None

def test_protected_endpoint(token, endpoint_url="http://localhost:8000/companies"):
    """Probar acceso a un endpoint protegido usando el token"""
    try:
        # Llamar al endpoint con el token
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(endpoint_url, headers=headers)
        
        # Verificar respuesta
        if response.status_code == 200:
            print(f"✅ Acceso exitoso al endpoint: {endpoint_url}")
            print(f"📄 Respuesta: {json.dumps(response.json(), indent=2)[:100]}...")
            return True
        else:
            print(f"❌ Error al acceder al endpoint: {response.status_code}")
            print(f"📄 Detalle: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error en la petición: {str(e)}")
        return False

def test_without_token(endpoint_url="http://localhost:8000/companies"):
    """Probar acceso sin token (debe fallar)"""
    try:
        response = requests.get(endpoint_url)
        print(f"🔒 Respuesta sin token: {response.status_code}")
        print(f"📄 Detalle: {response.text}")
        return response.status_code
    except Exception as e:
        print(f"❌ Error en la petición: {str(e)}")
        return None

if __name__ == "__main__":
    print("=== TEST DE AUTENTICACIÓN CON COGNITO ===")
    
    # Solicitar credenciales
    username = input("Usuario: ")
    password = input("Contraseña: ")
    
    # Probar autenticación
    tokens = authenticate_cognito(username, password)
    
    if tokens and tokens.get("id_token"):
        # Probar acceso con token válido
        print("\n=== PRUEBA CON TOKEN VÁLIDO ===")
        test_protected_endpoint(tokens["id_token"])
        
        # Probar sin token (debe fallar)
        print("\n=== PRUEBA SIN TOKEN (DEBE FALLAR) ===")
        test_without_token()
    else:
        print("No se pudo obtener token. Verifica tus credenciales.")