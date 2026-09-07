from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_admin
from app.models.models import (
    User, FarmerProfile, BuyerProfile, FPOProfile, CropLot, Offer,
    Transaction, MarketPrice, MarketSyncLog, Crop, Market
)
from app.schemas.schemas import (
    AdminStatsResponse, UserResponse, CropLotResponse,
    ManualMarketPriceCreate, BuyerVerificationUpdate
)
from app.services.market_price_service import MarketPriceService
from app.api.lots import format_lot

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_farmers = db.query(User).filter(User.role == "Farmer").count()
    total_buyers = db.query(User).filter(User.role == "Buyer").count()
    total_fpos = db.query(User).filter(User.role == "FPO").count()
    active_listings = db.query(CropLot).filter(CropLot.status == "Available").count()
    active_offers = db.query(Offer).filter(Offer.status.in_(["Pending", "Countered"])).count()
    completed_txns = db.query(Transaction).filter(Transaction.order_status == "Completed").count()
    suspicious_count = db.query(CropLot).filter(CropLot.is_flagged_suspicious == True).count()

    api_status = MarketPriceService.get_sync_status(db)

    return {
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_fpos": total_fpos,
        "active_listings": active_listings,
        "active_offers": active_offers,
        "completed_transactions": completed_txns,
        "flagged_suspicious_listings": suspicious_count,
        "api_status": api_status
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(desc(User.created_at)).all()

@router.patch("/buyers/{buyer_id}/verify")
def toggle_buyer_verification(
    buyer_id: int,
    update: BuyerVerificationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    prof = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Buyer profile not found.")

    prof.verification_status = update.verification_status
    db.commit()
    return {
        "message": f"Buyer verification status updated to {update.verification_status}",
        "buyer_id": buyer_id,
        "verification_status": prof.verification_status
    }

@router.get("/anomalies", response_model=List[CropLotResponse])
def get_suspicious_listings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    lots = db.query(CropLot).filter(CropLot.is_flagged_suspicious == True).order_by(desc(CropLot.created_at)).all()
    return [format_lot(l) for l in lots]

@router.patch("/anomalies/{lot_id}/clear")
def clear_anomaly_flag(
    lot_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    lot = db.query(CropLot).filter(CropLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Crop lot not found.")
    lot.is_flagged_suspicious = False
    lot.suspicious_reason = "Cleared by Admin Review"
    db.commit()
    return {"message": "Listing anomaly flag cleared."}

@router.post("/market-prices/manual")
def add_manual_verified_price(
    price_in: ManualMarketPriceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    crop = db.query(Crop).filter(Crop.id == price_in.crop_id).first()
    market = db.query(Market).filter(Market.id == price_in.market_id).first()
    if not crop or not market:
        raise HTTPException(status_code=404, detail="Crop or Market not found.")

    rec = MarketPrice(
        crop_id=price_in.crop_id,
        market_id=price_in.market_id,
        price_date=price_in.price_date or date.today(),
        min_price=price_in.min_price,
        max_price=price_in.max_price,
        modal_price=price_in.modal_price,
        arrivals_tonnes=price_in.arrivals_tonnes,
        unit="INR/Quintal",
        data_source="Admin Desk Inspection",
        data_status="ADMIN VERIFIED"
    )
    db.add(rec)
    db.commit()
    return {"message": "Verified market price inserted successfully.", "data_status": "ADMIN VERIFIED"}

@router.post("/sync-now")
def trigger_sync_now(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return MarketPriceService.sync_market_prices(db)
