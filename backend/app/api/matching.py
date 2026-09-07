from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import CropLot, BuyerRequirement
from app.services.matching_service import MatchingService
from app.api.lots import format_lot
from app.api.buyers import format_req

router = APIRouter(prefix="/matching", tags=["Smart Farmer-Buyer Matching"])

@router.get("/requirement/{requirement_id}")
def match_lots_for_requirement(requirement_id: int, db: Session = Depends(get_db)):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Buyer requirement not found.")

    matches = MatchingService.match_lots_for_requirement(db, req)
    formatted = []
    for m in matches:
        formatted.append({
            "lot": format_lot(m["lot"]),
            "match_score": m["match_score"],
            "reasons": m["reasons"],
            "price_difference_percent": m["price_difference_percent"]
        })
    return {
        "requirement": format_req(req),
        "matches": formatted
    }

@router.get("/lot/{lot_id}")
def match_requirements_for_lot(lot_id: int, db: Session = Depends(get_db)):
    lot = db.query(CropLot).filter(CropLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Crop lot not found.")

    matches = MatchingService.match_requirements_for_lot(db, lot)
    formatted = []
    for m in matches:
        formatted.append({
            "requirement": format_req(m["requirement"]),
            "match_score": m["match_score"],
            "reasons": m["reasons"],
            "price_difference_percent": m["price_difference_percent"]
        })
    return {
        "lot": format_lot(lot),
        "matches": formatted
    }
