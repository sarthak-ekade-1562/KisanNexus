from typing import Tuple, Optional
from sqlalchemy.orm import Session
from app.models.models import MarketPrice

class AnomalyService:
    @staticmethod
    def check_listing_price_anomaly(
        db: Session,
        crop_id: int,
        expected_price: float,
        district: str = "Nashik"
    ) -> Tuple[bool, Optional[str]]:
        # Fetch latest modal prices for this crop in the district or overall
        prices = db.query(MarketPrice).filter(MarketPrice.crop_id == crop_id).all()
        if not prices:
            return False, None

        # Filter for district if available, otherwise take all
        district_prices = [p.modal_price for p in prices if p.market and district.lower() in p.market.district.lower()]
        if not district_prices:
            district_prices = [p.modal_price for p in prices]

        avg_modal = sum(district_prices) / len(district_prices)

        # Flag if price deviates significantly (>40% higher or >45% lower than average modal)
        if expected_price > avg_modal * 1.45:
            reason = f"Price appears unusual compared with recent market data (Asking ₹{expected_price:,.0f}/Q vs average market modal ₹{avg_modal:,.0f}/Q)."
            return True, reason
        elif expected_price < avg_modal * 0.50:
            reason = f"Price appears unusually low compared with recent market benchmark (Asking ₹{expected_price:,.0f}/Q vs average market modal ₹{avg_modal:,.0f}/Q)."
            return True, reason

        return False, None
