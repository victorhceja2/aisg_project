from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    username = request.username
    password = request.password
    
    print(f"Login attempt: {username} {password}")
    
    try:
        # Obtener variables de entorno
        server = os.getenv("SQL_SERVER_HOST")
        database = os.getenv("SQL_SERVER_DB")
        db_username = os.getenv("SQL_SERVER_USER")
        db_password = os.getenv("SQL_SERVER_PASSWORD")
        
        # Crear cadena de conexión para pyodbc
        connection_string = (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={db_username};"
            f"PWD={db_password};"
            f"TrustServerCertificate=yes;"
            f"Encrypt=yes"
        )
        
        # Conectar a la base de datos
        conn = pyodbc.connect(connection_string, timeout=10)
        cursor = conn.cursor()
        
        # Ejecutar consulta de login con la tabla y campos correctos
        cursor.execute("""
            SELECT userId, userName, perfil
            FROM DBtableUserHeader
            WHERE userNick = ? AND password = ? AND estatus = 1
        """, (username, password))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            return {
                "message": "Login successful", 
                "user_id": user[0], 
                "username": user[1],
                "perfil": user[2]
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        print(f"Error en conexión o consulta SQL: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")