from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import (
    RecommendationRequest, WhereShouldISellResponse,
    NetProfitCalcRequest, NetProfitCalcResponse
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations & Net Profit"])

@router.post("/where-to-sell", response_model=WhereShouldISellResponse)
def where_should_i_sell(req: RecommendationRequest, db: Session = Depends(get_db)):
    try:
        result = RecommendationService.recommend_markets(
            db=db,
            crop_id=req.crop_id,
            quantity_quintals=req.quantity_quintals,
            farmer_location=req.farmer_location,
            quality_grade=req.quality_grade
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error evaluating markets: {str(e)}")

@router.post("/net-profit", response_model=NetProfitCalcResponse)
def calculate_net_profit(req: NetProfitCalcRequest):
    return RecommendationService.calculate_net_profit(
        market_price=req.market_price,
        quantity_quintals=req.quantity_quintals,
        transport_cost=req.transport_cost,
        handling_and_other_costs=req.handling_and_other_costs
    )
