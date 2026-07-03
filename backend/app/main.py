import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .core.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from .api.v1.router import api_router
from .database.session import SessionLocal, engine
from .database.base import Base
from .services.auth_service import AuthService
from .models import *

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        auth_service = AuthService(db)
        auth_service.seed_admin()
    finally:
        db.close()
    yield

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Mount assets folder
assets_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"name": settings.PROJECT_NAME, "version": settings.VERSION}
