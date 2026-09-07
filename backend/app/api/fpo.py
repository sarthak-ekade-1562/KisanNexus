from typing import List, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import CropLot, Crop, User, Offer, Transaction
from app.schemas.schemas import CropLotCreate, CropLotResponse
from app.api.lots import format_lot

router = APIRouter(prefix="/fpo", tags=["FPO & Farmer Groups"])

@router.get("/aggregated-crops")
def get_aggregated_crops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Summarizes member crops, total available volumes, and estimated value."""
    summary = db.query(
        Crop.id,
        Crop.name,
        Crop.hindi_name,
        func.sum(CropLot.quantity_quintals).label("total_quintals"),
        func.count(CropLot.id).label("total_lots"),
        func.avg(CropLot.expected_price).label("avg_expected_price")
    ).join(CropLot, Crop.id == CropLot.crop_id).filter(
        CropLot.status == "Available"
    ).group_by(Crop.id, Crop.name, Crop.hindi_name).all()

    results = []
    for s in summary:
        qty = round(s.total_quintals or 0, 1)
        avg_p = round(s.avg_expected_price or 0, 0)
        results.append({
            "crop_id": s.id,
            "crop_name": s.name,
            "hindi_name": s.hindi_name,
            "total_quantity_quintals": qty,
            "total_lots_count": s.total_lots,
            "average_expected_price": avg_p,
            "aggregated_value": round(qty * avg_p, 2)
        })

    return {
        "fpo_name": current_user.fpo_profile.fpo_name if current_user.fpo_profile else "Farmer Producer Company",
        "member_count": current_user.fpo_profile.member_count if current_user.fpo_profile else 540,
        "aggregated_crops": results
    }

@router.post("/group-listing", response_model=CropLotResponse)
def create_group_listing(
    lot_in: CropLotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["FPO", "Admin"]:
        raise HTTPException(status_code=403, detail="Only FPO accounts can create bulk group listings.")

    lot = CropLot(
        farmer_id=current_user.id,
        crop_id=lot_in.crop_id,
        quantity_quintals=lot_in.quantity_quintals,
        quality_grade=lot_in.quality_grade,
        variety=f"FPO Aggregated {lot_in.variety}",
        expected_price=lot_in.expected_price,
        location=f"{current_user.location or 'FPO Hub'}, {lot_in.district}",
        district=lot_in.district,
        state=lot_in.state,
        harvest_date=lot_in.harvest_date or date.today(),
        availability_date=lot_in.availability_date or date.today(),
        status="Available",
        is_flagged_suspicious=False
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return format_lot(lot)

@router.get("/analytics")
def get_fpo_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_volume = db.query(func.sum(CropLot.quantity_quintals)).scalar() or 0
    active_listings = db.query(CropLot).filter(CropLot.status == "Available").count()
    completed_txns = db.query(Transaction).filter(Transaction.order_status == "Completed").count()
    total_revenue = db.query(func.sum(Transaction.gross_amount)).scalar() or 0

    return {
        "total_member_volume_quintals": round(total_volume, 1),
        "active_bulk_listings": active_listings,
        "completed_group_transactions": completed_txns,
        "total_group_turnover": round(total_revenue, 2),
        "estimated_bulk_freight_savings": "18.5%"  # Typical volume freight discount for aggregated full-truck loads
    }
