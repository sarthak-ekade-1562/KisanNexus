from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import Offer, Negotiation, CropLot, Transaction, User, Notification
from app.schemas.schemas import OfferCreate, OfferResponse, CounterOfferRequest, NegotiationResponse

router = APIRouter(prefix="/offers", tags=["Offers & Negotiation"])

def format_offer(o: Offer) -> dict:
    buyer_user = o.buyer
    buyer_prof = buyer_user.buyer_profile if buyer_user else None
    farmer_user = o.farmer

    negs = [
        {
            "id": n.id,
            "offer_id": n.offer_id,
            "sender_id": n.sender_id,
            "sender_role": n.sender_role,
            "counter_price": n.counter_price,
            "message": n.message,
            "created_at": n.created_at
        }
        for n in o.negotiations
    ]

    return {
        "id": o.id,
        "lot_id": o.lot_id,
        "crop_name": o.lot.crop.name if o.lot and o.lot.crop else "Produce",
        "buyer_id": o.buyer_id,
        "buyer_name": buyer_user.full_name if buyer_user else "Buyer",
        "buyer_company": buyer_prof.company_name if buyer_prof else "Trading House",
        "buyer_verification": buyer_prof.verification_status if buyer_prof else "UNVERIFIED",
        "farmer_id": o.farmer_id,
        "farmer_name": farmer_user.full_name if farmer_user else "Farmer",
        "offered_price": o.offered_price,
        "quantity": o.quantity,
        "delivery_date": o.delivery_date,
        "notes": o.notes,
        "status": o.status,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
        "negotiations": negs
    }

@router.post("", response_model=OfferResponse)
def create_offer(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["Buyer", "Admin"]:
        raise HTTPException(status_code=403, detail="Only registered buyers can place purchase offers.")

    lot = db.query(CropLot).filter(CropLot.id == offer_in.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Crop lot not found.")
    if lot.status != "Available":
        raise HTTPException(status_code=400, detail="This lot is no longer available for offers.")

    offer = Offer(
        lot_id=lot.id,
        buyer_id=current_user.id,
        farmer_id=lot.farmer_id,
        offered_price=offer_in.offered_price,
        quantity=offer_in.quantity,
        delivery_date=offer_in.delivery_date or date.today(),
        notes=offer_in.notes,
        status="Pending"
    )
    db.add(offer)
    db.flush()

    # Notify farmer
    notif = Notification(
        user_id=lot.farmer_id,
        title="New Purchase Offer Received!",
        message=f"{current_user.full_name} offered ₹{offer_in.offered_price:,.0f}/Q for {offer_in.quantity} Q of your {lot.crop.name}.",
        notification_type="OFFER",
        link="/offers"
    )
    db.add(notif)
    db.commit()
    db.refresh(offer)
    return format_offer(offer)

@router.get("/farmer", response_model=List[OfferResponse])
def get_farmer_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offers = db.query(Offer).filter(Offer.farmer_id == current_user.id).order_by(desc(Offer.created_at)).all()
    return [format_offer(o) for o in offers]

@router.get("/buyer", response_model=List[OfferResponse])
def get_buyer_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offers = db.query(Offer).filter(Offer.buyer_id == current_user.id).order_by(desc(Offer.created_at)).all()
    return [format_offer(o) for o in offers]

@router.post("/{offer_id}/counter", response_model=OfferResponse)
def counter_offer(
    offer_id: int,
    req: CounterOfferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")

    if current_user.id not in [offer.farmer_id, offer.buyer_id]:
        raise HTTPException(status_code=403, detail="Unauthorized to negotiate this offer.")

    # Record negotiation step
    sender_role = "Farmer" if current_user.id == offer.farmer_id else "Buyer"
    neg = Negotiation(
        offer_id=offer.id,
        sender_id=current_user.id,
        sender_role=sender_role,
        counter_price=req.counter_price,
        message=req.message
    )
    db.add(neg)

    offer.offered_price = req.counter_price
    offer.status = "Countered"
    offer.updated_at = datetime.utcnow()

    # Notify counterparty
    recipient_id = offer.buyer_id if current_user.id == offer.farmer_id else offer.farmer_id
    notif = Notification(
        user_id=recipient_id,
        title="Counter Offer Received",
        message=f"{current_user.full_name} countered with ₹{req.counter_price:,.0f}/Quintal: '{req.message or 'Revised price'}'",
        notification_type="COUNTER",
        link="/offers"
    )
    db.add(notif)
    db.commit()
    db.refresh(offer)
    return format_offer(offer)

@router.post("/{offer_id}/accept", response_model=OfferResponse)
def accept_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")

    if current_user.id not in [offer.farmer_id, offer.buyer_id]:
        raise HTTPException(status_code=403, detail="Unauthorized to accept this offer.")
    if offer.status == "Accepted" and offer.transaction:
        return format_offer(offer)
    if offer.status == "Rejected" or offer.status == "Expired":
        raise HTTPException(status_code=400, detail="This offer is no longer active.")

    lot = offer.lot
    if not lot or lot.status not in ["Available", "Offer Received"]:
        raise HTTPException(status_code=400, detail="This crop lot is no longer available.")
    if offer.quantity <= 0 or offer.quantity > lot.quantity_quintals:
        raise HTTPException(status_code=400, detail="Offer quantity exceeds the available lot quantity.")

    offer.status = "Accepted"
    offer.updated_at = datetime.utcnow()

    # Mark crop lot as reserved
    lot = offer.lot
    if lot:
        lot.status = "Reserved"

    # Automatically create official Transaction
    gross = round(offer.offered_price * offer.quantity, 2)
    transport_est = 1200.0  # standard local aggregation freight
    platform_fee = round(gross * 0.005, 2)  # 0.5% nominal SIH mock platform fee
    net_payout = round(gross - transport_est - platform_fee, 2)

    import uuid
    txn = Transaction(
        offer_id=offer.id,
        lot_id=offer.lot_id,
        buyer_id=offer.buyer_id,
        farmer_id=offer.farmer_id,
        agreed_price=offer.offered_price,
        quantity=offer.quantity,
        gross_amount=gross,
        transport_cost=transport_est,
        platform_fee=platform_fee,
        net_farmer_payout=net_payout,
        payment_status="Escrow_Held",
        order_status="Confirmed",
        tracking_number=f"KNX-TXN-{uuid.uuid4().hex[:8].upper()}",
        pickup_location=lot.location if lot else None,
        delivery_location=offer.buyer.location if offer.buyer else None
    )
    db.add(txn)

    # Notify both parties
    db.add(Notification(
        user_id=offer.farmer_id,
        title="Offer Accepted! Order Confirmed",
        message=f"Deal locked at ₹{offer.offered_price:,.0f}/Q for {offer.quantity} Q. Order #{txn.tracking_number} created with Escrow protection.",
        notification_type="TRANSACTION",
        link="/transactions"
    ))
    db.add(Notification(
        user_id=offer.buyer_id,
        title="Offer Accepted! Order Confirmed",
        message=f"Farmer accepted your offer of ₹{offer.offered_price:,.0f}/Q. Order #{txn.tracking_number} is ready for dispatch scheduling.",
        notification_type="TRANSACTION",
        link="/transactions"
    ))

    db.commit()
    db.refresh(offer)
    return format_offer(offer)

@router.post("/{offer_id}/reject", response_model=OfferResponse)
def reject_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")

    offer.status = "Rejected"
    offer.updated_at = datetime.utcnow()

    # Notify counterparty
    recipient_id = offer.buyer_id if current_user.id == offer.farmer_id else offer.farmer_id
    db.add(Notification(
        user_id=recipient_id,
        title="Offer Declined",
        message=f"Offer of ₹{offer.offered_price:,.0f}/Q was not accepted by the counterparty.",
        notification_type="OFFER",
        link="/offers"
    ))

    db.commit()
    db.refresh(offer)
    return format_offer(offer)
