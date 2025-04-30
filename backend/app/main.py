from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.login import router as login_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir rutas
app.include_router(login_router)