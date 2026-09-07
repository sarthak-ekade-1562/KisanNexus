from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import CropLot, BuyerRequirement, User

class MatchingService:
    @staticmethod
    def match_lots_for_requirement(
        db: Session,
        requirement: BuyerRequirement
    ) -> List[Dict[str, Any]]:
        # Find active crop lots
        lots = db.query(CropLot).filter(
            CropLot.status == "Available",
            CropLot.crop_id == requirement.crop_id
        ).all()

        results = []
        for lot in lots:
            score = 35  # Base match for same crop
            reasons = ["Matching crop variety"]

            # Quantity match
            qty_ratio = lot.quantity_quintals / requirement.required_quantity
            if 0.8 <= qty_ratio <= 1.5:
                score += 25
                reasons.append(f"Quantity aligns closely ({lot.quantity_quintals} Q vs {requirement.required_quantity} Q needed)")
            elif 0.4 <= qty_ratio <= 2.5:
                score += 15
                reasons.append(f"Substantial quantity fulfillment possible ({lot.quantity_quintals} Q available)")
            else:
                score += 5
                reasons.append(f"Partial quantity lot ({lot.quantity_quintals} Q)")

            # Grade match
            if lot.quality_grade == requirement.quality_grade:
                score += 20
                reasons.append(f"Exact quality grade match ({lot.quality_grade})")
            elif lot.quality_grade == "Grade A" and requirement.quality_grade in ["Grade B", "Grade C"]:
                score += 20
                reasons.append("Premium quality exceeds requirement baseline")
            else:
                score += 10
                reasons.append(f"Alternative grade offered ({lot.quality_grade})")

            # Price compatibility
            price_diff_pct = ((lot.expected_price - requirement.budget_price) / requirement.budget_price) * 100
            if lot.expected_price <= requirement.budget_price:
                score += 20
                reasons.append(f"Expected price (₹{lot.expected_price:,.0f}) within buyer budget (₹{requirement.budget_price:,.0f})")
            elif price_diff_pct <= 10:
                score += 12
                reasons.append("Price within 10% negotiable range")
            else:
                score += 4
                reasons.append("Price exceeds current target budget")

            # Regional compatibility
            if requirement.district.lower() in lot.location.lower() or lot.district.lower() in requirement.region.lower():
                reasons.append(f"Direct regional proximity in {lot.district}")

            score = min(score, 100)

            results.append({
                "lot": lot,
                "match_score": score,
                "reasons": reasons,
                "price_difference_percent": round(price_diff_pct, 1)
            })

        # Sort highest match score first
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results

    @staticmethod
    def match_requirements_for_lot(
        db: Session,
        lot: CropLot
    ) -> List[Dict[str, Any]]:
        requirements = db.query(BuyerRequirement).filter(
            BuyerRequirement.status == "Open",
            BuyerRequirement.crop_id == lot.crop_id
        ).all()

        results = []
        for req in requirements:
            score = 35
            reasons = ["Matching commodity demand"]

            # Quantity match
            qty_ratio = lot.quantity_quintals / req.required_quantity
            if 0.8 <= qty_ratio <= 1.5:
                score += 25
                reasons.append(f"Matches required bulk volume ({req.required_quantity} Q)")
            elif 0.4 <= qty_ratio <= 2.5:
                score += 15
                reasons.append(f"Fulfills significant procurement share ({req.required_quantity} Q)")
            else:
                score += 5

            # Grade match
            if lot.quality_grade == req.quality_grade:
                score += 20
                reasons.append(f"Matches buyer specified grade ({req.quality_grade})")
            elif lot.quality_grade == "Grade A":
                score += 20
                reasons.append("Premium quality satisfies institutional standards")
            else:
                score += 10

            # Price match
            price_diff_pct = ((lot.expected_price - req.budget_price) / req.budget_price) * 100
            if lot.expected_price <= req.budget_price:
                score += 20
                reasons.append(f"Buyer budget (₹{req.budget_price:,.0f}/Q) meets or exceeds your asking price")
            elif price_diff_pct <= 10:
                score += 12
                reasons.append("Close price negotiation potential")
            else:
                score += 4

            if req.district.lower() in lot.district.lower():
                reasons.append(f"Buyer accepts pickup in {lot.district}")

            score = min(score, 100)

            results.append({
                "requirement": req,
                "match_score": score,
                "reasons": reasons,
                "price_difference_percent": round(price_diff_pct, 1)
            })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results
