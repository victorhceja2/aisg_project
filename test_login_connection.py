import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    try:
        # Obtener variables de entorno
        server = os.getenv("SQL_SERVER_HOST")
        database = os.getenv("SQL_SERVER_DB")
        username = os.getenv("SQL_SERVER_USER")
        password = os.getenv("SQL_SERVER_PASSWORD")
        
        print(f"Servidor: {server}")
        print(f"Base de datos: {database}")
        print(f"Usuario: {username}")
        
        # Probar diferentes configuraciones de cadena de conexión
        connection_strings = [
            f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=yes",
            f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server},{1433};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=yes",
            f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=no"
        ]
        
        for i, conn_str in enumerate(connection_strings, 1):
            try:
                print(f"\nProbando conexión {i}...")
                print(f"Cadena: {conn_str}")
                conn = pyodbc.connect(conn_str, timeout=10)
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                print(f"¡Conexión {i} exitosa! Resultado: {result[0]}")
                cursor.close()
                conn.close()
                return True
            except Exception as e:
                print(f"Conexión {i} falló: {e}")
        
        return False
        
    except Exception as e:
        print(f"Error general: {e}")
        return False

if __name__ == "__main__":
    test_connection()
