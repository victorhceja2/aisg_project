
# AISG Backend Dockerizado

## Requisitos
- Docker
- Docker Compose

## Pasos

1. Copia `.env.example` a `.env` y edita los valores según tu configuración de SQL Server.

2. Construye e inicia el contenedor:

```
docker-compose up --build
```

3. Accede a FastAPI en: http://localhost:8000/docs
