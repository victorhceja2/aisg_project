from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Reemplaza estos datos con los reales
SQL_SERVER_USER = "sa"
SQL_SERVER_PASSWORD = "Vic1973"
SQL_SERVER_HOST = "66.179.95.14"
SQL_SERVER_PORT = "1433"
SQL_SERVER_DB = "aisgProduction"

DATABASE_URL = (
    f"mssql+pyodbc://{SQL_SERVER_USER}:{SQL_SERVER_PASSWORD}"
    f"@{SQL_SERVER_HOST}:{SQL_SERVER_PORT}/{SQL_SERVER_DB}"
    "?driver=ODBC+Driver+17+for+SQL+Server"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()