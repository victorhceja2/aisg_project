import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

try:
    # Listar drivers disponibles
    print("Drivers disponibles:")
    for driver in pyodbc.drivers():
        print(f"  - {driver}")
    
    # Intentar conexión
    server = os.getenv("SQL_SERVER_HOST")
    database = os.getenv("SQL_SERVER_DB")
    username = os.getenv("SQL_SERVER_USER")
    password = os.getenv("SQL_SERVER_PASSWORD")
    
    connection_string = f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=yes"
    
    print(f"Intentando conectar a: {server}")
    conn = pyodbc.connect(connection_string)
    print("¡Conexión exitosa!")
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
