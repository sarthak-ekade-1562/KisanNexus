from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import PriceAlert, User, Crop, Market
from app.schemas.schemas import PriceAlertCreate, PriceAlertResponse

router = APIRouter(prefix="/price-alerts", tags=["Price Alerts"])

def format_alert(a: PriceAlert) -> dict:
    return {
        "id": a.id,
        "farmer_id": a.farmer_id,
        "crop_id": a.crop_id,
        "crop_name": a.crop.name if a.crop else "Produce",
        "market_id": a.market_id,
        "market_name": a.market.name if a.market else "Any Mandi",
        "target_price": a.target_price,
        "condition": a.condition,
        "is_active": a.is_active,
        "triggered_at": a.triggered_at,
        "created_at": a.created_at
    }

@router.get("", response_model=List[PriceAlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alerts = db.query(PriceAlert).filter(PriceAlert.farmer_id == current_user.id).all()
    return [format_alert(a) for a in alerts]

@router.post("", response_model=PriceAlertResponse)
def create_alert(
    alert_in: PriceAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = PriceAlert(
        farmer_id=current_user.id,
        crop_id=alert_in.crop_id,
        market_id=alert_in.market_id,
        target_price=alert_in.target_price,
        condition=alert_in.condition,
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return format_alert(alert)

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id, PriceAlert.farmer_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found.")
    db.delete(alert)
    db.commit()
    return {"message": "Alert removed successfully."}
