from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import PricePredictionResponse, PriceTrendPoint
from app.services.prediction_service import PredictionService
from app.models.models import MarketPrice, Crop, Market

router = APIRouter(prefix="/predictions", tags=["Price Prediction & Trends"])

@router.get("/forecast", response_model=PricePredictionResponse)
def get_prediction_forecast(
    crop_id: int,
    market_id: int,
    db: Session = Depends(get_db)
):
    try:
        return PredictionService.get_price_prediction(db, crop_id, market_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/trends", response_model=List[PriceTrendPoint])
def get_price_trends(
    crop_id: int,
    market_id: int,
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    records = db.query(MarketPrice).filter(
        MarketPrice.crop_id == crop_id,
        MarketPrice.market_id == market_id
    ).order_by(MarketPrice.price_date.desc()).limit(days).all()

    # Return in chronological order
    records.reverse()
    return [
        {
            "date": r.price_date,
            "min_price": r.min_price,
            "max_price": r.max_price,
            "modal_price": r.modal_price
        }
        for r in records
    ]
