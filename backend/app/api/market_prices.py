from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.models import Crop, Market, MarketPrice, User
from app.schemas.schemas import CropResponse, MarketResponse, MarketPriceResponse, MarketPriceSyncStatus
from app.services.market_price_service import MarketPriceService

router = APIRouter(tags=["Market Prices"])

@router.get("/crops", response_model=List[CropResponse])
def get_crops(db: Session = Depends(get_db)):
    return db.query(Crop).filter(Crop.is_active == True).all()

@router.get("/markets", response_model=List[MarketResponse])
def get_markets(db: Session = Depends(get_db)):
    return db.query(Market).all()

@router.get("/market-prices", response_model=List[MarketPriceResponse])
def get_market_prices(
    crop_id: Optional[int] = None,
    crop_name: Optional[str] = None,
    market_id: Optional[int] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    target_date: Optional[date] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(MarketPrice).join(Crop).join(Market)

    if crop_id:
        query = query.filter(MarketPrice.crop_id == crop_id)
    if crop_name:
        query = query.filter(Crop.name.ilike(f"%{crop_name}%"))
    if market_id:
        query = query.filter(MarketPrice.market_id == market_id)
    if district:
        query = query.filter(Market.district.ilike(f"%{district}%"))
    if state:
        query = query.filter(Market.state.ilike(f"%{state}%"))
    if target_date:
        query = query.filter(MarketPrice.price_date == target_date)
    else:
        # Default to latest date available
        latest_date = db.query(MarketPrice.price_date).order_by(desc(MarketPrice.price_date)).first()
        if latest_date:
            query = query.filter(MarketPrice.price_date == latest_date[0])

    if min_price is not None:
        query = query.filter(MarketPrice.modal_price >= min_price)
    if max_price is not None:
        query = query.filter(MarketPrice.modal_price <= max_price)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Crop.name.ilike(s)) |
            (Crop.hindi_name.ilike(s)) |
            (Market.name.ilike(s)) |
            (Market.district.ilike(s))
        )

    records = query.order_by(desc(MarketPrice.modal_price)).limit(limit).all()

    # Format response items
    response = []
    for r in records:
        response.append({
            "id": r.id,
            "crop_id": r.crop_id,
            "crop_name": r.crop.name,
            "hindi_name": r.crop.hindi_name,
            "market_id": r.market_id,
            "market_name": r.market.name,
            "district": r.market.district,
            "state": r.market.state,
            "price_date": r.price_date,
            "min_price": r.min_price,
            "max_price": r.max_price,
            "modal_price": r.modal_price,
            "arrivals_tonnes": r.arrivals_tonnes,
            "unit": r.unit,
            "data_source": r.data_source,
            "data_status": r.data_status,
            "updated_at": r.updated_at
        })
    return response

@router.get("/market-prices/status", response_model=MarketPriceSyncStatus)
def get_sync_status(db: Session = Depends(get_db)):
    return MarketPriceService.get_sync_status(db)

@router.post("/market-prices/sync")
def sync_market_prices(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    result = MarketPriceService.sync_market_prices(db)
    return result
