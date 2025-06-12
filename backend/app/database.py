from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
import pyodbc

load_dotenv()

# Cargar variables de entorno
SQL_SERVER_USER = os.getenv("SQL_SERVER_USER")
SQL_SERVER_PASSWORD = os.getenv("SQL_SERVER_PASSWORD")
SQL_SERVER_HOST = os.getenv("SQL_SERVER_HOST")
SQL_SERVER_PORT = os.getenv("SQL_SERVER_PORT", "1433")
SQL_SERVER_DB = os.getenv("SQL_SERVER_DB")

print(f"Connecting to database: {SQL_SERVER_HOST}:{SQL_SERVER_PORT}/{SQL_SERVER_DB}")

# Verificar que todas las variables estén definidas
if not all([SQL_SERVER_USER, SQL_SERVER_PASSWORD, SQL_SERVER_HOST, SQL_SERVER_DB]):
    raise ValueError("Faltan variables de entorno de la base de datos")

# Construir la URL de conexión para SQLAlchemy
DATABASE_URL = (
    f"mssql+pyodbc://{SQL_SERVER_USER}:{quote_plus(SQL_SERVER_PASSWORD)}"
    f"@{SQL_SERVER_HOST}:{SQL_SERVER_PORT}/{SQL_SERVER_DB}"
    f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes&Encrypt=yes"
)

# Crear engine y sesión
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()