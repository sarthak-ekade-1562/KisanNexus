import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "KisanNexus"
    PROJECT_DESCRIPTION: str = "AI-powered agricultural market intelligence and smart trading platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kisannexus.db")
    
    # JWT & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "kisan_secret_sih_2026_super_secure_key_for_kisannexus")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # External APIs (with graceful demo fallback when credentials absent)
    MARKET_API_URL: Optional[str] = os.getenv("MARKET_API_URL", None)
    MARKET_API_KEY: Optional[str] = os.getenv("MARKET_API_KEY", None)
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY", None)
    AI_API_KEY: Optional[str] = os.getenv("AI_API_KEY", None)
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
