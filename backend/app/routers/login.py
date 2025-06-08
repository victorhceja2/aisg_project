from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pyodbc

router = APIRouter()

# Esquema de entrada
class LoginRequest(BaseModel):
    username: str
    password: str

# Esquema de respuesta
class LoginResponse(BaseModel):
    userId: str
    userName: str
    perfil: str

# Endpoint
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    print("Login attempt:", request.username, request.password)

    conn = None
    cursor = None

    try:
        conn = pyodbc.connect(
            'Driver={ODBC Driver 17 for SQL Server};'
            'Server=66.179.95.14;'
            'Database=aisgProduction;'
            'UID=sa;'
            'PWD=Vic1973;'
            'TrustServerCertificate=yes;'
        )
        cursor = conn.cursor()

        cursor.execute("""
            SELECT userId, userName, perfil
            FROM DBtableUserHeader
            WHERE userNick = ? AND password = ? AND estatus = 1
        """, (request.username, request.password))

        user = cursor.fetchone()

        if user:
            return {
                "userId": user.userId,
                "userName": user.userName,
                "perfil": user.perfil
            }
        else:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    except pyodbc.Error as e:
        print("Error en conexión o consulta SQL:", e)  # Agrega este print
        raise HTTPException(status_code=500, detail=f"Error de conexión a la base de datos: {str(e)}")

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()