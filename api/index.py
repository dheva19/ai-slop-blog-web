import sys
from pathlib import Path

# Memastikan modul app terdeteksi saat running lokal maupun di Vercel serverless
api_dir = Path(__file__).resolve().parent
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.controllers.auth_controller import router as auth_router
from app.controllers.post_controller import router as post_router
from app.controllers.interaction_controller import router as interaction_router
from app.controllers.analytics_controller import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: koneksi mongodb
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Agar bisa diakses baik lewat /docs maupun /api/docs
@app.get("/api/docs", include_in_schema=False)
async def api_docs_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

# Konfigurasi CORS agar frontend dapat memanggil API secara mulus
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all layered controllers
app.include_router(auth_router, prefix="/api")
app.include_router(post_router, prefix="/api")
app.include_router(interaction_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}

# Handler export untuk Vercel Serverless Function
handler = app
