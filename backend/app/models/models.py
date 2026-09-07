from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, default="Farmer")  # Farmer, FPO, Buyer, Admin
    location = Column(String(255), nullable=True)
    state = Column(String(100), default="Maharashtra")
    district = Column(String(100), default="Nashik")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)
    fpo_profile = relationship("FPOProfile", back_populates="user", uselist=False)
    lots = relationship("CropLot", back_populates="farmer")
    requirements = relationship("BuyerRequirement", back_populates="buyer")
    notifications = relationship("Notification", back_populates="user")
    alerts = relationship("PriceAlert", back_populates="farmer")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    farm_size_acres = Column(Float, default=5.0)
    primary_crops = Column(String(255), default="Onion, Tomato")
    irrigation_type = Column(String(100), default="Drip Irrigation")
    upi_id = Column(String(100), default="farmer@upi")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False, default="Agri Trade Co.")
    gst_number = Column(String(50), nullable=True)
    license_number = Column(String(100), nullable=True)
    business_type = Column(String(100), default="Wholesaler")  # Wholesaler, Retail Chain, Exporter, Processor
    verification_status = Column(String(50), default="UNVERIFIED")  # VERIFIED, UNVERIFIED
    rating = Column(Float, default=4.5)
    response_rate = Column(Float, default=95.0)
    completed_orders = Column(Integer, default=0)
    trade_volume_quintals = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="buyer_profile")

class FPOProfile(Base):
    __tablename__ = "fpo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    fpo_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), nullable=True)
    member_count = Column(Integer, default=100)
    district = Column(String(100), default="Nashik")
    state = Column(String(100), default="Maharashtra")
    operational_villages = Column(String(255), default="Niphad, Dindori, Yeola")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="fpo_profile")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    hindi_name = Column(String(100), nullable=True)
    category = Column(String(50), default="Vegetable")
    standard_unit = Column(String(50), default="Quintal")
    icon = Column(String(50), default="apple")
    shelf_life_days = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)

    prices = relationship("MarketPrice", back_populates="crop")
    lots = relationship("CropLot", back_populates="crop")

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    apmc_code = Column(String(50), unique=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    state = Column(String(100), default="Maharashtra")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    market_fee_percent = Column(Float, default=1.0)  # 1% APMC cess
    handling_charge_per_quintal = Column(Float, default=20.0)  # ₹20/Q hamali/handling
    operating_days = Column(String(100), default="Mon-Sat")
    contact_info = Column(String(255), nullable=True)

    prices = relationship("MarketPrice", back_populates="market")

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False, index=True)
    price_date = Column(Date, default=date.today, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    arrivals_tonnes = Column(Float, default=50.0)
    unit = Column(String(50), default="INR/Quintal")
    data_source = Column(String(100), default="AGMARKNET / Mandi Gateway")
    data_status = Column(String(50), default="DEMO DATA")  # DEMO DATA, LIVE / VERIFIED DATA, ADMIN VERIFIED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    crop = relationship("Crop", back_populates="prices")
    market = relationship("Market", back_populates="prices")

class CropLot(Base):
    __tablename__ = "crop_lots"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    quality_grade = Column(String(50), default="Grade A")  # Grade A, Grade B, Grade C
    variety = Column(String(100), default="Red Garwa / Desi")
    expected_price = Column(Float, nullable=False)  # ₹ per Quintal
    location = Column(String(255), nullable=False)
    district = Column(String(100), default="Nashik")
    state = Column(String(100), default="Maharashtra")
    harvest_date = Column(Date, default=date.today)
    availability_date = Column(Date, default=date.today)
    status = Column(String(50), default="Available")  # Available, Reserved, Sold
    is_flagged_suspicious = Column(Boolean, default=False)
    suspicious_reason = Column(String(255), nullable=True)
    # Crop photos are stored as data URLs for the demo/prototype so they persist with the database.
    # For production, replace with object-storage URLs (S3/Cloudinary/etc.).
    image_urls = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="lots")
    crop = relationship("Crop", back_populates="lots")
    offers = relationship("Offer", back_populates="lot")
    transactions = relationship("Transaction", back_populates="lot")

class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    required_quantity = Column(Float, nullable=False)  # in Quintals
    quality_grade = Column(String(50), default="Grade A")
    region = Column(String(255), default="Nashik Region")
    district = Column(String(100), default="Nashik")
    budget_price = Column(Float, nullable=False)  # ₹ per Quintal
    delivery_date = Column(Date, default=date.today)
    status = Column(String(50), default="Open")  # Open, Partially_Fulfilled, Closed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="requirements")
    crop = relationship("Crop")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("crop_lots.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("buyer_requirements.id"), nullable=True)
    offered_price = Column(Float, nullable=False)  # ₹ per Quintal
    quantity = Column(Float, nullable=False)  # in Quintals
    delivery_date = Column(Date, default=date.today)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Countered, Accepted, Rejected, Expired
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lot = relationship("CropLot", back_populates="offers")
    buyer = relationship("User", foreign_keys=[buyer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    negotiations = relationship("Negotiation", back_populates="offer", cascade="all, delete-orphan")
    transaction = relationship("Transaction", back_populates="offer", uselist=False)

class Negotiation(Base):
    __tablename__ = "negotiations"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(50), nullable=False)  # Buyer, Farmer
    counter_price = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    offer = relationship("Offer", back_populates="negotiations")
    sender = relationship("User")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    lot_id = Column(Integer, ForeignKey("crop_lots.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agreed_price = Column(Float, nullable=False)  # ₹ per Quintal
    quantity = Column(Float, nullable=False)  # Quintals
    gross_amount = Column(Float, nullable=False)  # agreed_price * quantity
    transport_cost = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    net_farmer_payout = Column(Float, nullable=False)
    payment_status = Column(String(50), default="Escrow_Pending")  # Escrow_Pending, Escrow_Held, Released, Completed
    order_status = Column(String(50), default="Confirmed")  # Confirmed, In_Transit, Delivered, Completed, Cancelled
    tracking_number = Column(String(100), nullable=True)
    pickup_location = Column(String(500), nullable=True)
    delivery_location = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    offer = relationship("Offer", back_populates="transaction")
    lot = relationship("CropLot", back_populates="transactions")
    buyer = relationship("User", foreign_keys=[buyer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=True)
    target_price = Column(Float, nullable=False)
    condition = Column(String(50), default="GREATER_EQUAL")  # GREATER_EQUAL, LESS_EQUAL
    is_active = Column(Boolean, default=True)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="alerts")
    crop = relationship("Crop")
    market = relationship("Market")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="SYSTEM")  # OFFER, COUNTER, ACCEPTED, TRANSACTION, ALERT, SYSTEM
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class MarketSyncLog(Base):
    __tablename__ = "market_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), default="AGMARKNET / Mandi Gateway")
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED
    records_imported = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    sync_timestamp = Column(DateTime, default=datetime.utcnow)

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    category = Column(String(100), default="Payment Issue")
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")  # OPEN, IN_REVIEW, RESOLVED
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    transaction = relationship("Transaction")
