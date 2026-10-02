"""
SIH26120 BagheTwin FastAPI Application
Authoritative entry point for Baghewala Well-to-Surface Digital Twin.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.endpoints import router as api_v1_router
from app.core.database import init_db
from scripts.seed_demo import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is ready and demo data seeded
    init_db()
    seed_database()
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Engineering-grade decision support digital twin for Baghewala heavy-oil field (Jodhpur Sandstone). "
        "Couples Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP) physics with ML surrogates "
        "and constrained multi-objective optimization. All telemetry and data marked SYNTHETIC / DEMO."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "mode": "SIMULATION / DECISION SUPPORT",
        "data_status": "SYNTHETIC / DEMO",
        "documentation": "/docs",
        "disclaimer": "Authoritative prototype for SIH26120. No direct physical equipment control."
    }
