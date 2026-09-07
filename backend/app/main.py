import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from starlette.responses import FileResponse
from app.core.config import settings
from app.database.session import Base, engine
from app.database.seed_data import seed_database

# Routers
from app.api.auth import router as auth_router
from app.api.market_prices import router as market_prices_router
from app.api.recommendations import router as recommendations_router
from app.api.predictions import router as predictions_router
from app.api.lots import router as lots_router
from app.api.buyers import router as buyers_router
from app.api.matching import router as matching_router
from app.api.offers import router as offers_router
from app.api.transactions import router as transactions_router
from app.api.price_alerts import router as price_alerts_router
from app.api.notifications import router as notifications_router
from app.api.weather import router as weather_router
from app.api.advisor import router as advisor_router
from app.api.fpo import router as fpo_router
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kisannexus")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed data
    Base.metadata.create_all(bind=engine)
    # Lightweight schema migration for existing SQLite/Render databases.
    try:
        inspector = inspect(engine)
        with engine.begin() as conn:
            lot_cols = {c["name"] for c in inspector.get_columns("crop_lots")} if inspector.has_table("crop_lots") else set()
            txn_cols = {c["name"] for c in inspector.get_columns("transactions")} if inspector.has_table("transactions") else set()
            if "image_urls" not in lot_cols:
                conn.execute(text("ALTER TABLE crop_lots ADD COLUMN image_urls TEXT"))
            if "pickup_location" not in txn_cols:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN pickup_location VARCHAR(500)"))
            if "delivery_location" not in txn_cols:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN delivery_location VARCHAR(500)"))
    except Exception as e:
        logger.error(f"Schema migration warning: {e}")
    try:
        seed_database()
    except Exception as e:
        logger.error(f"Error during database seed: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(market_prices_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(predictions_router, prefix=api_prefix)
app.include_router(lots_router, prefix=api_prefix)
app.include_router(buyers_router, prefix=api_prefix)
app.include_router(matching_router, prefix=api_prefix)
app.include_router(offers_router, prefix=api_prefix)
app.include_router(transactions_router, prefix=api_prefix)
app.include_router(price_alerts_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(weather_router, prefix=api_prefix)
app.include_router(advisor_router, prefix=api_prefix)
app.include_router(fpo_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "kisannexus-backend"}

# Frontend Website Static Mount and SPA Fallback
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_index():
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index_file)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude reserved API paths
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json", "health"]:
            raise HTTPException(status_code=404, detail="API endpoint not found")

        # Check if direct file exists (e.g. favicon.svg, icons.svg)
        direct_file = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(direct_file) and os.path.isfile(direct_file):
            return FileResponse(direct_file)

        # Fallback to index.html for client-side routing (React Router)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

        raise HTTPException(status_code=404, detail="Page not found")
else:
    @app.get("/")
    def fallback_root():
        return {
            "project": "KisanNexus",
            "description": "AI-Powered Agricultural Market Intelligence & Smart Trading Platform",
            "docs": "/docs",
            "note": "Frontend build not found. Run 'npm run build' inside frontend directory to serve the website."
        }
