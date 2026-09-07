from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import Transaction, User, Notification
from app.schemas.schemas import TransactionResponse, TransactionStatusUpdate

router = APIRouter(prefix="/transactions", tags=["Transactions & Fulfillment"])

def format_txn(t: Transaction) -> dict:
    return {
        "id": t.id,
        "offer_id": t.offer_id,
        "lot_id": t.lot_id,
        "crop_name": t.lot.crop.name if t.lot and t.lot.crop else "Produce",
        "buyer_id": t.buyer_id,
        "buyer_name": t.buyer.full_name if t.buyer else "Buyer",
        "farmer_id": t.farmer_id,
        "farmer_name": t.farmer.full_name if t.farmer else "Farmer",
        "agreed_price": t.agreed_price,
        "quantity": t.quantity,
        "gross_amount": t.gross_amount,
        "transport_cost": t.transport_cost,
        "platform_fee": t.platform_fee,
        "net_farmer_payout": t.net_farmer_payout,
        "payment_status": t.payment_status,
        "order_status": t.order_status,
        "tracking_number": t.tracking_number,
        "pickup_location": t.pickup_location,
        "delivery_location": t.delivery_location,
        "created_at": t.created_at,
        "updated_at": t.updated_at
    }

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Admin":
        txns = db.query(Transaction).order_by(desc(Transaction.created_at)).all()
    elif current_user.role == "Buyer":
        txns = db.query(Transaction).filter(Transaction.buyer_id == current_user.id).order_by(desc(Transaction.created_at)).all()
    else:
        txns = db.query(Transaction).filter(Transaction.farmer_id == current_user.id).order_by(desc(Transaction.created_at)).all()

    return [format_txn(t) for t in txns]

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_detail(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if current_user.role != "Admin" and current_user.id not in [txn.farmer_id, txn.buyer_id]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this transaction.")

    return format_txn(txn)

@router.patch("/{transaction_id}/status", response_model=TransactionResponse)
def update_transaction_status(
    transaction_id: int,
    status_in: TransactionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if status_in.order_status:
        txn.order_status = status_in.order_status
        # If delivered or completed, mark lot sold
        if status_in.order_status in ["Delivered", "Completed"] and txn.lot:
            txn.lot.status = "Sold"

    if status_in.payment_status:
        txn.payment_status = status_in.payment_status

    if status_in.tracking_number:
        txn.tracking_number = status_in.tracking_number

    txn.updated_at = datetime.utcnow()

    # Notify counterparty
    other_id = txn.buyer_id if current_user.id == txn.farmer_id else txn.farmer_id
    db.add(Notification(
        user_id=other_id,
        title=f"Order Update #{txn.tracking_number}",
        message=f"Order status changed to {txn.order_status} | Payment: {txn.payment_status}",
        notification_type="TRANSACTION",
        link="/transactions"
    ))

    db.commit()
    db.refresh(txn)
    return format_txn(txn)
