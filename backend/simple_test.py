import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

# Obtener variables
server = os.getenv("SQL_SERVER_HOST")
database = os.getenv("SQL_SERVER_DB")
username = os.getenv("SQL_SERVER_USER")
password = os.getenv("SQL_SERVER_PASSWORD")

print(f"Server: {server}")
print(f"Database: {database}")
print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'None'}")

# Probar diferentes cadenas de conexión
connection_strings = [
    f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=yes",
    f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server},{1433};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=yes",
    f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;Encrypt=no"
]

for i, conn_str in enumerate(connection_strings, 1):
    try:
        print(f"\nProbando conexión {i}...")
        conn = pyodbc.connect(conn_str, timeout=10)
        print(f"¡Conexión {i} exitosa!")
        conn.close()
        break
    except Exception as e:
        print(f"Conexión {i} falló: {e}")
