import os
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests

JWKS_URL = os.getenv("JWKS_URL")
AUDIENCE = os.getenv("COGNITO_TOKEN")

class CustomHTTPBearer(HTTPBearer):
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials is None or credentials.scheme.lower() != "bearer":
            raise HTTPException(status_code=403, detail="No autorizado")
        token = credentials.credentials
        payload = self.verify_jwt(token)
        request.state.user = payload
        return credentials

    def verify_jwt(self, token: str) -> dict:
        try:
            # Obtener JWKS
            jwks = requests.get(JWKS_URL).json()
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
            if not key:
                raise HTTPException(status_code=401, detail="Clave de firma no encontrada")
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=AUDIENCE,
            )
            return payload
        except JWTError as e:
            raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Error de autenticación: {str(e)}")