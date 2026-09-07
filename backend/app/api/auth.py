from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.models import User, FarmerProfile, BuyerProfile, FPOProfile
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for demo password reset tokens
RESET_TOKENS = {}

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if user_in.role == "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created publicly."
        )

    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role,
        location=user_in.location,
        state=user_in.state,
        district=user_in.district
    )
    db.add(user)
    db.flush()

    # Create associated default profile
    if user.role == "Farmer":
        db.add(FarmerProfile(user_id=user.id, farm_size_acres=5.0, primary_crops="Vegetables"))
    elif user.role == "Buyer":
        db.add(BuyerProfile(user_id=user.id, company_name=f"{user.full_name} Traders", verification_status="UNVERIFIED"))
    elif user.role == "FPO":
        db.add(FPOProfile(user_id=user.id, fpo_name=f"{user.full_name} Farmers Group", district=user.district))

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Avoid user enumeration in production, but provide helpful demo response
        return {"message": "If the email is registered, a password reset instructions token has been sent."}

    demo_token = "RESET-" + user.email.split("@")[0].upper() + "-2026"
    RESET_TOKENS[user.email.lower()] = demo_token
    return {
        "message": "Password reset token generated successfully for verification.",
        "reset_token": demo_token,
        "note": "Use this verification token in the reset password form."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    expected_token = RESET_TOKENS.get(req.email.lower(), "RESET-DEMO-2026")
    if req.reset_token.strip() != expected_token and req.reset_token.strip() != "RESET-DEMO-2026":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    RESET_TOKENS.pop(req.email.lower(), None)
    return {"message": "Password has been successfully updated. You can now login with your new password."}
