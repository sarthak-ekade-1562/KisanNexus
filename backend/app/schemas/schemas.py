from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "Farmer"
    location: Optional[str] = "Nashik"
    state: str = "Maharashtra"
    district: str = "Nashik"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class FarmerProfileResponse(BaseModel):
    id: int
    farm_size_acres: float
    primary_crops: str
    irrigation_type: str
    upi_id: str

    class Config:
        from_attributes = True

class BuyerProfileResponse(BaseModel):
    id: int
    company_name: str
    gst_number: Optional[str]
    license_number: Optional[str]
    business_type: str
    verification_status: str
    rating: float
    response_rate: float
    completed_orders: int
    trade_volume_quintals: float

    class Config:
        from_attributes = True

class FPOProfileResponse(BaseModel):
    id: int
    fpo_name: str
    registration_number: Optional[str]
    member_count: int
    district: str
    state: str
    operational_villages: str

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    created_at: datetime
    farmer_profile: Optional[FarmerProfileResponse] = None
    buyer_profile: Optional[BuyerProfileResponse] = None
    fpo_profile: Optional[FPOProfileResponse] = None

    class Config:
        from_attributes = True

# --- Crop & Market Schemas ---
class CropResponse(BaseModel):
    id: int
    name: str
    hindi_name: Optional[str]
    category: str
    standard_unit: str
    icon: str
    shelf_life_days: int

    class Config:
        from_attributes = True

class MarketResponse(BaseModel):
    id: int
    name: str
    apmc_code: str
    district: str
    state: str
    latitude: float
    longitude: float
    market_fee_percent: float
    handling_charge_per_quintal: float
    operating_days: str
    contact_info: Optional[str]

    class Config:
        from_attributes = True

class MarketPriceResponse(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    hindi_name: Optional[str]
    market_id: int
    market_name: str
    district: str
    state: str
    price_date: date
    min_price: float
    max_price: float
    modal_price: float
    arrivals_tonnes: float
    unit: str
    data_source: str
    data_status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class MarketPriceSyncStatus(BaseModel):
    api_connected: bool
    data_source: str
    last_sync_time: Optional[datetime]
    total_records: int
    last_status: str
    last_error: Optional[str]
    data_status_mode: str  # LIVE / VERIFIED DATA or DEMO DATA

# --- Recommendation & Profit Schemas ---
class RecommendationRequest(BaseModel):
    crop_id: int
    quantity_quintals: float = Field(..., gt=0)
    farmer_location: str = "Nashik"
    quality_grade: str = "Grade A"
    preferred_date: Optional[date] = None

class MarketComparisonItem(BaseModel):
    market_id: int
    market_name: str
    district: str
    distance_km: float
    modal_price: float
    min_price: float
    max_price: float
    gross_revenue: float
    transport_cost: float
    handling_and_cess: float
    expected_net_return: float
    buyer_demand_level: str  # High, Moderate, Normal
    is_best_market: bool = False
    reasons: List[str]

class WhereShouldISellResponse(BaseModel):
    crop_name: str
    quantity_quintals: float
    farmer_location: str
    quality_grade: str
    best_market: MarketComparisonItem
    all_markets: List[MarketComparisonItem]
    disclaimer: str

class NetProfitCalcRequest(BaseModel):
    market_price: float = Field(..., gt=0)
    quantity_quintals: float = Field(..., gt=0)
    transport_cost: float = Field(0, ge=0)
    handling_and_other_costs: float = Field(0, ge=0)

class NetProfitCalcResponse(BaseModel):
    market_price: float
    quantity_quintals: float
    gross_revenue: float
    transport_cost: float
    handling_and_other_costs: float
    expected_net_return: float
    net_margin_percent: float

# --- Price Prediction & Sell Now vs Wait ---
class PriceTrendPoint(BaseModel):
    date: date
    min_price: float
    max_price: float
    modal_price: float

class PricePredictionResponse(BaseModel):
    crop_name: str
    market_name: str
    current_modal_price: float
    predicted_min_price: float
    predicted_modal_price: float
    predicted_max_price: float
    confidence_percentage: float
    trend_direction: str  # "UPWARD", "DOWNWARD", "STABLE"
    recommendation: str    # "SELL NOW" or "CONSIDER WAITING"
    decision_reasons: List[str]
    recent_trend: List[PriceTrendPoint]
    disclaimer: str

# --- Crop Lot (Digital Lots) Schemas ---
class CropLotCreate(BaseModel):
    crop_id: int
    quantity_quintals: float = Field(..., gt=0)
    quality_grade: str = "Grade A"
    variety: str = "Red Garwa"
    expected_price: float = Field(..., gt=0)
    location: str = "Nashik"
    district: str = "Nashik"
    state: str = "Maharashtra"
    harvest_date: Optional[date] = None
    availability_date: Optional[date] = None
    image_urls: List[str] = Field(default_factory=list, max_length=5)

class CropLotResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: Optional[str]
    crop_id: int
    crop_name: str
    quantity_quintals: float
    quality_grade: str
    variety: str
    expected_price: float
    location: str
    district: str
    state: str
    harvest_date: date
    availability_date: date
    status: str
    is_flagged_suspicious: bool
    suspicious_reason: Optional[str]
    image_urls: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

# --- Buyer Requirements & Matching ---
class BuyerRequirementCreate(BaseModel):
    crop_id: int
    required_quantity: float = Field(..., gt=0)
    quality_grade: str = "Grade A"
    region: str = "Nashik Region"
    district: str = "Nashik"
    budget_price: float = Field(..., gt=0)
    delivery_date: Optional[date] = None
    notes: Optional[str] = None

class BuyerRequirementResponse(BaseModel):
    id: int
    buyer_id: int
    buyer_name: str
    company_name: str
    verification_status: str
    crop_id: int
    crop_name: str
    required_quantity: float
    quality_grade: str
    region: str
    district: str
    budget_price: float
    delivery_date: date
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MatchResultItem(BaseModel):
    lot: CropLotResponse
    match_score: int  # 0 to 100%
    reasons: List[str]
    price_difference_percent: float

# --- Offer & Negotiation Schemas ---
class OfferCreate(BaseModel):
    lot_id: int
    offered_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    delivery_date: Optional[date] = None
    notes: Optional[str] = None

class NegotiationResponse(BaseModel):
    id: int
    offer_id: int
    sender_id: int
    sender_role: str
    counter_price: float
    message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CounterOfferRequest(BaseModel):
    counter_price: float = Field(..., gt=0)
    message: Optional[str] = None

class OfferResponse(BaseModel):
    id: int
    lot_id: int
    crop_name: str
    buyer_id: int
    buyer_name: str
    buyer_company: str
    buyer_verification: str
    farmer_id: int
    farmer_name: str
    offered_price: float
    quantity: float
    delivery_date: date
    notes: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    negotiations: List[NegotiationResponse] = []

    class Config:
        from_attributes = True

# --- Transaction Schemas ---
class TransactionResponse(BaseModel):
    id: int
    offer_id: int
    lot_id: int
    crop_name: str
    buyer_id: int
    buyer_name: str
    farmer_id: int
    farmer_name: str
    agreed_price: float
    quantity: float
    gross_amount: float
    transport_cost: float
    platform_fee: float
    net_farmer_payout: float
    payment_status: str
    order_status: str
    tracking_number: Optional[str]
    pickup_location: Optional[str]
    delivery_location: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionStatusUpdate(BaseModel):
    payment_status: Optional[str] = None
    order_status: Optional[str] = None
    tracking_number: Optional[str] = None

# --- Price Alert & Notifications ---
class PriceAlertCreate(BaseModel):
    crop_id: int
    market_id: Optional[int] = None
    target_price: float = Field(..., gt=0)
    condition: str = "GREATER_EQUAL"

class PriceAlertResponse(BaseModel):
    id: int
    farmer_id: int
    crop_id: int
    crop_name: str
    market_id: Optional[int]
    market_name: Optional[str]
    target_price: float
    condition: str
    is_active: bool
    triggered_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Weather Schemas ---
class WeatherForecastItem(BaseModel):
    day: str
    temp_min: float
    temp_max: float
    condition: str
    rainfall_prob: int
    humidity: int

class WeatherResponse(BaseModel):
    location: str
    district: str
    temperature: float
    humidity: int
    rainfall_mm: float
    wind_speed_kmh: float
    weather_condition: str
    data_status: str  # LIVE WEATHER DATA or DEMO WEATHER DATA
    advisories: List[str]
    forecast_5day: List[WeatherForecastItem]

# --- AI Advisor ---
class AdvisorQuestionRequest(BaseModel):
    question: str
    crop: Optional[str] = None
    location: Optional[str] = None

class AdvisorAnswerResponse(BaseModel):
    question: str
    answer: str
    context_used: List[str]
    disclaimer: str

# --- Admin Schemas ---
class AdminStatsResponse(BaseModel):
    total_farmers: int
    total_buyers: int
    total_fpos: int
    active_listings: int
    active_offers: int
    completed_transactions: int
    flagged_suspicious_listings: int
    api_status: MarketPriceSyncStatus

class ManualMarketPriceCreate(BaseModel):
    crop_id: int
    market_id: int
    price_date: Optional[date] = None
    min_price: float
    max_price: float
    modal_price: float
    arrivals_tonnes: float = 50.0

class BuyerVerificationUpdate(BaseModel):
    verification_status: str  # VERIFIED or UNVERIFIED
