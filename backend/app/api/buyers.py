from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import BuyerRequirement, BuyerProfile, Crop, User
from app.schemas.schemas import BuyerRequirementCreate, BuyerRequirementResponse, BuyerProfileResponse

router = APIRouter(prefix="/buyers", tags=["Buyer Requirements & Profiles"])

def format_req(req: BuyerRequirement) -> dict:
    buyer_user = req.buyer
    prof = buyer_user.buyer_profile if buyer_user else None
    return {
        "id": req.id,
        "buyer_id": req.buyer_id,
        "buyer_name": buyer_user.full_name if buyer_user else "Buyer",
        "company_name": prof.company_name if prof else "Trading House",
        "verification_status": prof.verification_status if prof else "UNVERIFIED",
        "crop_id": req.crop_id,
        "crop_name": req.crop.name if req.crop else "Produce",
        "required_quantity": req.required_quantity,
        "quality_grade": req.quality_grade,
        "region": req.region,
        "district": req.district,
        "budget_price": req.budget_price,
        "delivery_date": req.delivery_date,
        "status": req.status,
        "notes": req.notes,
        "created_at": req.created_at
    }

@router.post("/requirements", response_model=BuyerRequirementResponse)
def create_requirement(
    req_in: BuyerRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["Buyer", "Admin"]:
        raise HTTPException(status_code=403, detail="Only verified buyers can post procurement requirements.")

    req = BuyerRequirement(
        buyer_id=current_user.id,
        crop_id=req_in.crop_id,
        required_quantity=req_in.required_quantity,
        quality_grade=req_in.quality_grade,
        region=req_in.region,
        district=req_in.district,
        budget_price=req_in.budget_price,
        delivery_date=req_in.delivery_date or date.today(),
        status="Open",
        notes=req_in.notes
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return format_req(req)

@router.get("/requirements", response_model=List[BuyerRequirementResponse])
def list_requirements(
    crop_id: Optional[int] = None,
    status_filter: Optional[str] = "Open",
    db: Session = Depends(get_db)
):
    query = db.query(BuyerRequirement).join(Crop).join(User)
    if crop_id:
        query = query.filter(BuyerRequirement.crop_id == crop_id)
    if status_filter and status_filter != "ALL":
        query = query.filter(BuyerRequirement.status == status_filter)

    reqs = query.order_by(desc(BuyerRequirement.created_at)).all()
    return [format_req(r) for r in reqs]

@router.get("/my-requirements", response_model=List[BuyerRequirementResponse])
def get_my_requirements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reqs = db.query(BuyerRequirement).filter(
        BuyerRequirement.buyer_id == current_user.id
    ).order_by(desc(BuyerRequirement.created_at)).all()
    return [format_req(r) for r in reqs]

@router.get("/verified-buyers", response_model=List[BuyerProfileResponse])
def get_verified_buyers(db: Session = Depends(get_db)):
    return db.query(BuyerProfile).filter(BuyerProfile.verification_status == "VERIFIED").all()
