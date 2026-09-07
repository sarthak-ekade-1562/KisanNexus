from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import CropLot, Crop, User
from app.schemas.schemas import CropLotCreate, CropLotResponse
from app.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/lots", tags=["Crop Lots (Digital Lots)"])

def format_lot(lot: CropLot) -> dict:
    return {
        "id": lot.id,
        "farmer_id": lot.farmer_id,
        "farmer_name": lot.farmer.full_name if lot.farmer else "Farmer",
        "farmer_phone": lot.farmer.phone if lot.farmer else None,
        "crop_id": lot.crop_id,
        "crop_name": lot.crop.name if lot.crop else "Produce",
        "quantity_quintals": lot.quantity_quintals,
        "quality_grade": lot.quality_grade,
        "variety": lot.variety,
        "expected_price": lot.expected_price,
        "location": lot.location,
        "district": lot.district,
        "state": lot.state,
        "harvest_date": lot.harvest_date,
        "availability_date": lot.availability_date,
        "status": lot.status,
        "is_flagged_suspicious": lot.is_flagged_suspicious,
        "suspicious_reason": lot.suspicious_reason,
        "image_urls": __import__("json").loads(lot.image_urls) if lot.image_urls else [],
        "created_at": lot.created_at
    }

@router.post("", response_model=CropLotResponse)
def create_crop_lot(
    lot_in: CropLotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["Farmer", "FPO", "Admin"]:
        raise HTTPException(status_code=403, detail="Only Farmers and FPOs can list crop lots.")

    # Check for suspicious price anomaly
    is_suspicious, reason = AnomalyService.check_listing_price_anomaly(
        db=db,
        crop_id=lot_in.crop_id,
        expected_price=lot_in.expected_price,
        district=lot_in.district
    )

    lot = CropLot(
        farmer_id=current_user.id,
        crop_id=lot_in.crop_id,
        quantity_quintals=lot_in.quantity_quintals,
        quality_grade=lot_in.quality_grade,
        variety=lot_in.variety,
        expected_price=lot_in.expected_price,
        location=lot_in.location,
        district=lot_in.district,
        state=lot_in.state,
        harvest_date=lot_in.harvest_date or date.today(),
        availability_date=lot_in.availability_date or date.today(),
        status="Available",
        is_flagged_suspicious=is_suspicious,
        suspicious_reason=reason,
        image_urls=__import__("json").dumps(lot_in.image_urls or [])
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return format_lot(lot)

@router.get("", response_model=List[CropLotResponse])
def list_lots(
    crop_id: Optional[int] = None,
    quality_grade: Optional[str] = None,
    district: Optional[str] = None,
    status_filter: Optional[str] = "Available",
    db: Session = Depends(get_db)
):
    query = db.query(CropLot).join(Crop).join(User)
    if crop_id:
        query = query.filter(CropLot.crop_id == crop_id)
    if quality_grade:
        query = query.filter(CropLot.quality_grade == quality_grade)
    if district:
        query = query.filter(CropLot.district.ilike(f"%{district}%"))
    if status_filter and status_filter != "ALL":
        query = query.filter(CropLot.status == status_filter)

    lots = query.order_by(desc(CropLot.created_at)).all()
    return [format_lot(l) for l in lots]

@router.get("/my-lots", response_model=List[CropLotResponse])
def get_my_lots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lots = db.query(CropLot).filter(CropLot.farmer_id == current_user.id).order_by(desc(CropLot.created_at)).all()
    return [format_lot(l) for l in lots]

@router.get("/{lot_id}", response_model=CropLotResponse)
def get_lot_detail(lot_id: int, db: Session = Depends(get_db)):
    lot = db.query(CropLot).filter(CropLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Crop lot not found.")
    return format_lot(lot)
