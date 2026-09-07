import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Market, MarketPrice, Crop, BuyerRequirement

# Known approximate road distances (in km) from Maharashtra hubs to APMC Mandis
DISTANCE_MATRIX: Dict[str, Dict[str, float]] = {
    "nashik": {
        "Nashik APMC": 8.0,
        "Lasalgaon APMC": 58.0,
        "Pimpalgaon Baswant APMC": 32.0,
        "Yeola APMC": 85.0,
        "Pune APMC (Gultekdi)": 210.0,
        "Mumbai APMC (Vashi)": 165.0,
        "Ahmednagar APMC": 155.0,
        "Nagpur APMC": 650.0,
    },
    "niphad": {
        "Nashik APMC": 40.0,
        "Lasalgaon APMC": 20.0,
        "Pimpalgaon Baswant APMC": 25.0,
        "Yeola APMC": 48.0,
        "Pune APMC (Gultekdi)": 230.0,
        "Mumbai APMC (Vashi)": 195.0,
        "Ahmednagar APMC": 140.0,
        "Nagpur APMC": 630.0,
    },
    "yeola": {
        "Nashik APMC": 85.0,
        "Lasalgaon APMC": 30.0,
        "Pimpalgaon Baswant APMC": 65.0,
        "Yeola APMC": 5.0,
        "Pune APMC (Gultekdi)": 245.0,
        "Mumbai APMC (Vashi)": 240.0,
        "Ahmednagar APMC": 115.0,
        "Nagpur APMC": 590.0,
    },
    "dindori": {
        "Nashik APMC": 28.0,
        "Lasalgaon APMC": 52.0,
        "Pimpalgaon Baswant APMC": 20.0,
        "Yeola APMC": 80.0,
        "Pune APMC (Gultekdi)": 235.0,
        "Mumbai APMC (Vashi)": 185.0,
        "Ahmednagar APMC": 175.0,
        "Nagpur APMC": 640.0,
    },
    "pune": {
        "Nashik APMC": 210.0,
        "Lasalgaon APMC": 250.0,
        "Pimpalgaon Baswant APMC": 235.0,
        "Yeola APMC": 245.0,
        "Pune APMC (Gultekdi)": 10.0,
        "Mumbai APMC (Vashi)": 145.0,
        "Ahmednagar APMC": 125.0,
        "Nagpur APMC": 710.0,
    },
}

DEFAULT_BASE_FREIGHT_PER_QUINTAL = 40.0  # ₹40 base loading/unloading
DEFAULT_PER_KM_RATE_PER_QUINTAL = 2.2    # ₹2.2 per km per quintal

class RecommendationService:
    @staticmethod
    def get_distance_km(farmer_location: str, market_name: str) -> float:
        norm_loc = farmer_location.strip().lower()
        # Look in known matrix
        for hub, distances in DISTANCE_MATRIX.items():
            if hub in norm_loc:
                if market_name in distances:
                    return distances[market_name]
                # Fallback to closest match
                for m_key, dist in distances.items():
                    if m_key.lower().split()[0] in market_name.lower():
                        return dist
        # Fallback default estimation based on typical inter-district mandi travel
        return 45.0

    @staticmethod
    def calculate_transport_cost(distance_km: float, quantity_quintals: float) -> float:
        """
        Transport cost = (Base freight + Distance * Per-Km Rate) * Quantity
        With minimum vehicle charter cap consideration.
        """
        unit_cost = DEFAULT_BASE_FREIGHT_PER_QUINTAL + (distance_km * DEFAULT_PER_KM_RATE_PER_QUINTAL)
        total = unit_cost * quantity_quintals
        return round(max(total, 500.0), 2)  # Minimum transport booking floor

    @staticmethod
    def calculate_net_profit(
        market_price: float,
        quantity_quintals: float,
        transport_cost: float,
        handling_and_other_costs: float
    ) -> Dict[str, float]:
        gross_revenue = round(market_price * quantity_quintals, 2)
        total_costs = round(transport_cost + handling_and_other_costs, 2)
        expected_net_return = round(gross_revenue - total_costs, 2)
        net_margin_percent = round((expected_net_return / gross_revenue * 100) if gross_revenue > 0 else 0.0, 2)
        return {
            "market_price": market_price,
            "quantity_quintals": quantity_quintals,
            "gross_revenue": gross_revenue,
            "transport_cost": transport_cost,
            "handling_and_other_costs": handling_and_other_costs,
            "expected_net_return": expected_net_return,
            "net_margin_percent": net_margin_percent
        }

    @staticmethod
    def recommend_markets(
        db: Session,
        crop_id: int,
        quantity_quintals: float,
        farmer_location: str = "Nashik",
        quality_grade: str = "Grade A"
    ) -> Dict[str, Any]:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise ValueError("Crop not found")

        markets = db.query(Market).all()
        comparison_list = []

        # Count active buyer demand in region
        buyer_demands = db.query(BuyerRequirement).filter(
            BuyerRequirement.crop_id == crop_id,
            BuyerRequirement.status == "Open"
        ).all()
        total_demand_qty = sum([b.required_quantity for b in buyer_demands])

        for market in markets:
            # Fetch latest price
            latest_price_record = db.query(MarketPrice).filter(
                MarketPrice.crop_id == crop_id,
                MarketPrice.market_id == market.id
            ).order_by(MarketPrice.price_date.desc(), MarketPrice.id.desc()).first()

            if not latest_price_record:
                continue

            modal_price = latest_price_record.modal_price
            # Adjust price slightly for Grade A (+5%) or Grade C (-8%)
            if quality_grade == "Grade A":
                adjusted_price = round(modal_price * 1.04, 2)
            elif quality_grade == "Grade C":
                adjusted_price = round(modal_price * 0.92, 2)
            else:
                adjusted_price = modal_price

            distance_km = RecommendationService.get_distance_km(farmer_location, market.name)
            transport_cost = RecommendationService.calculate_transport_cost(distance_km, quantity_quintals)
            
            gross_revenue = round(adjusted_price * quantity_quintals, 2)
            mandi_cess = round(gross_revenue * (market.market_fee_percent / 100.0), 2)
            handling = round(market.handling_charge_per_quintal * quantity_quintals, 2)
            mandi_costs = mandi_cess + handling

            net_return = round(gross_revenue - transport_cost - mandi_costs, 2)

            # Determine demand level
            if market.district.lower() in farmer_location.lower() or "lasalgaon" in market.name.lower():
                demand_level = "High"
            elif distance_km < 100:
                demand_level = "Moderate"
            else:
                demand_level = "Normal"

            comparison_list.append({
                "market_id": market.id,
                "market_name": market.name,
                "district": market.district,
                "distance_km": distance_km,
                "modal_price": adjusted_price,
                "min_price": latest_price_record.min_price,
                "max_price": latest_price_record.max_price,
                "gross_revenue": gross_revenue,
                "transport_cost": transport_cost,
                "handling_and_cess": mandi_costs,
                "expected_net_return": net_return,
                "buyer_demand_level": demand_level,
                "is_best_market": False,
                "reasons": []
            })

        if not comparison_list:
            raise ValueError("No price records available for this crop")

        # Sort by expected net return descending
        comparison_list.sort(key=lambda x: x["expected_net_return"], reverse=True)

        # Top market is BEST MARKET
        best = comparison_list[0]
        best["is_best_market"] = True
        
        # Formulate transparent "Why this market?" checklist
        best_net = best["expected_net_return"]
        best_price = best["modal_price"]
        best_dist = best["distance_km"]
        best_demand = best["buyer_demand_level"]
        reasons = [
            f"Highest expected net return of ₹{best_net:,.2f} for your lot",
            f"Favorable mandi price at ₹{best_price:,.2f}/quintal for {quality_grade}",
            f"Optimized road distance ({best_dist} km) balancing freight vs mandi realization",
            f"{best_demand} buyer participation and reliable daily auction liquidity"
        ]
        best["reasons"] = reasons

        # Populate reasons for second and other markets
        for idx, item in enumerate(comparison_list[1:], start=2):
            diff = best["expected_net_return"] - item["expected_net_return"]
            item["reasons"] = [
                f"Net return is ₹{diff:,.2f} lower than recommended {best['market_name']}",
                f"Distance: {item['distance_km']} km (Transport cost: ₹{item['transport_cost']:,.2f})",
                f"Active demand level: {item['buyer_demand_level']}"
            ]

        return {
            "crop_name": crop.name,
            "quantity_quintals": quantity_quintals,
            "farmer_location": farmer_location,
            "quality_grade": quality_grade,
            "best_market": best,
            "all_markets": comparison_list,
            "disclaimer": "AI recommendations are estimates based on reported mandi rates, typical transport tariffs and APMC charges. Actual auction bids and transit fuel costs may vary on the trade day."
        }

