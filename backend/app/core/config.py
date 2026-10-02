"""
SIH26120 Core Application Settings
Configures database connectivity, CORS origins, model paths, and security roles.
Supports both PostgreSQL (e.g. docker-compose) and local SQLite fallback.
"""

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    PROJECT_NAME: str = "BagheTwin Digital Twin"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database: Default to local SQLite fallback if DATABASE_URL not set in environment
    DATABASE_URL: str = Field(default_factory=lambda: os.getenv(
        "DATABASE_URL",
        f"sqlite:///{Path(__file__).resolve().parent.parent.parent / 'baghetwin.db'}"
    ))

    # CORS Allowlist
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Model & Artifact Directories
    ARTIFACTS_DIR: Path = Path(__file__).resolve().parent.parent.parent / "artifacts"
    MODELS_DIR: Path = ARTIFACTS_DIR / "models"

    # User Roles
    VALID_ROLES: List[str] = ["VIEWER", "ENGINEER", "OPERATOR", "ADMIN"]


settings = Settings()
