from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.routes import auth, users, appointments, services, ai, dashboard, payments, notifications
from app.core.config import settings
from app.db.base import Base
from app.db.session import sessionmanager
from app.models import *


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with sessionmanager.connect() as conn:
        if settings.ENVIRONMENT == "development":
            await conn.run_sync(Base.metadata.create_all)
    yield
    await sessionmanager.close()

app = FastAPI(lifespan=lifespan)

app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(appointments.router, prefix=settings.API_PREFIX)
app.include_router(services.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(payments.router, prefix=f"{settings.API_PREFIX}/payments", tags=["payments"])
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/health")
async def health():
    """
    Health check endpoint to verify if the API is running healthy.
    """
    async with sessionmanager.connect() as conn:
        # Perform a simple query to check the database connection
        result = await conn.execute(text("SELECT 1"))
        if result.scalar() != 1:
            return {"status": "unhealthy"}
    return {"status": "healthy mi king"}

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_root(full_path: str):
   if full_path.startswith(settings.API_PREFIX.strip("/")) or full_path.startswith("health"):
       raise HTTPException(status_code=404, detail="Not Found")
   return FileResponse("app/static/index.html")
