from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQL_SERVER_USER = "joan1"
SQL_SERVER_PASSWORD = ">8EtfWHq35@7(0<9xAM"
SQL_SERVER_HOST = "http://aisgqa.cz0rtlegnc6d.us-east-1.rds.amazonaws.com/"
SQL_SERVER_PORT = "1433"
SQL_SERVER_DB = "aisgProduction"
DRIVER = "ODBC Driver 18 for SQL Server"

DATABASE_URL = (
    f"mssql+pyodbc://{SQL_SERVER_USER}:{SQL_SERVER_PASSWORD}"
    f"@{SQL_SERVER_HOST}:{SQL_SERVER_PORT}/{SQL_SERVER_DB}"
    f"?driver={DRIVER}"
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