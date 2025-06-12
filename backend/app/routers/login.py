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
    
    print(f"Login attempt for userNick: {username}") # Password no se loguea por seguridad
    
    try:
        # Obtener variables de entorno
        server = os.getenv("SQL_SERVER_HOST")
        database = os.getenv("SQL_SERVER_DB")
        db_username = os.getenv("SQL_SERVER_USER")
        db_password = os.getenv("SQL_SERVER_PASSWORD")
        driver = os.getenv("DRIVER")
        
        # Crear cadena de conexión para pyodbc
        connection_string = (
            f"DRIVER={driver};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={db_username};"
            f"PWD={db_password};"
            f"TrustServerCertificate=yes;"
            f"Encrypt=yes" # Asegúrate que tu SQL Server está configurado para conexiones encriptadas o ajusta según sea necesario
        )
        
        # Conectar a la base de datos
        conn = pyodbc.connect(connection_string, timeout=10)
        cursor = conn.cursor()
        
        # Ejecutar consulta de login con la tabla y campos correctos
        # Campos seleccionados: userId, userName, userNick, email, perfil, nivel, companyCode, stationCode
        cursor.execute("""
            SELECT userId, userName, userNick, email, perfil, nivel, companyCode, stationCode
            FROM DBtableUserHeader
            WHERE userNick = ? AND password = ? AND estatus = 1
        """, (username, password))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            # Mapeo de los campos según el orden del SELECT
            # user[0] = userId
            # user[1] = userName
            # user[2] = userNick
            # user[3] = email
            # user[4] = perfil
            # user[5] = nivel
            # user[6] = companyCode
            # user[7] = stationCode
            return {
                "message": "Login successful", 
                "userId": user[0], 
                "userName": user[1],
                "userNick": user[2],
                "email": user[3],
                "perfil": user[4],
                "nivel": user[5],
                "companyCode": user[6],
                "stationCode": user[7]
            }
        else:
            print(f"Login failed for userNick: {username}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except pyodbc.Error as db_err:
        print(f"Database specific error: {db_err}")
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    except Exception as e:
        print(f"Error en conexión o consulta SQL: {e}")
        raise HTTPException(status_code=500, detail="Database connection or query error")