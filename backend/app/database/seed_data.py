import logging
from datetime import datetime, date, timedelta
from app.database.session import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, FarmerProfile, BuyerProfile, FPOProfile, Crop, Market, MarketPrice,
    CropLot, BuyerRequirement, Offer, Negotiation, Transaction, PriceAlert,
    Notification, MarketSyncLog
)

logger = logging.getLogger(__name__)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@kisannexus.in").first():
        print("Database already contains seed data.")
        db.close()
        return

    print("Seeding database with realistic agricultural data for KisanNexus...")

    # 1. Create Markets
    markets_data = [
        {"name": "Lasalgaon APMC", "apmc_code": "MH-APMC-01", "district": "Nashik", "state": "Maharashtra", "lat": 20.1477, "lng": 74.2337, "fee": 1.0, "handling": 22.0, "days": "Mon-Sat"},
        {"name": "Nashik APMC", "apmc_code": "MH-APMC-02", "district": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lng": 73.7898, "fee": 1.0, "handling": 20.0, "days": "Mon-Sat"},
        {"name": "Pimpalgaon Baswant APMC", "apmc_code": "MH-APMC-03", "district": "Nashik", "state": "Maharashtra", "lat": 20.1704, "lng": 73.9856, "fee": 1.0, "handling": 20.0, "days": "Mon-Sat"},
        {"name": "Yeola APMC", "apmc_code": "MH-APMC-04", "district": "Nashik", "state": "Maharashtra", "lat": 20.0435, "lng": 74.4886, "fee": 1.0, "handling": 18.0, "days": "Mon-Sat"},
        {"name": "Pune APMC (Gultekdi)", "apmc_code": "MH-APMC-05", "district": "Pune", "state": "Maharashtra", "lat": 18.4975, "lng": 73.8677, "fee": 1.2, "handling": 25.0, "days": "Daily"},
        {"name": "Mumbai APMC (Vashi)", "apmc_code": "MH-APMC-06", "district": "Mumbai Suburban", "state": "Maharashtra", "lat": 19.0760, "lng": 73.0035, "fee": 1.25, "handling": 30.0, "days": "Daily"},
        {"name": "Ahmednagar APMC", "apmc_code": "MH-APMC-07", "district": "Ahmednagar", "state": "Maharashtra", "lat": 19.0952, "lng": 74.7496, "fee": 1.0, "handling": 20.0, "days": "Mon-Sat"},
        {"name": "Nagpur APMC", "apmc_code": "MH-APMC-08", "district": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lng": 79.0882, "fee": 1.0, "handling": 22.0, "days": "Mon-Sat"}
    ]

    market_objs = {}
    for m in markets_data:
        m_obj = Market(
            name=m["name"],
            apmc_code=m["apmc_code"],
            district=m["district"],
            state=m["state"],
            latitude=m["lat"],
            longitude=m["lng"],
            market_fee_percent=m["fee"],
            handling_charge_per_quintal=m["handling"],
            operating_days=m["days"],
            contact_info=f"Secretary, {m['name']}, Helpline: 0253-257001"
        )
        db.add(m_obj)
        market_objs[m["name"]] = m_obj

    db.commit()

    # 2. Create Crops (16 common vegetables)
    crops_data = [
        {"name": "Onion", "hindi": "प्याज (Kanda)", "category": "Vegetable", "unit": "Quintal", "icon": "onion", "shelf": 45, "base_price": 2900},
        {"name": "Tomato", "hindi": "टमाटर", "category": "Vegetable", "unit": "Quintal", "icon": "tomato", "shelf": 8, "base_price": 2100},
        {"name": "Potato", "hindi": "आलू", "category": "Vegetable", "unit": "Quintal", "icon": "potato", "shelf": 60, "base_price": 1850},
        {"name": "Cabbage", "hindi": "पत्ता गोभी", "category": "Vegetable", "unit": "Quintal", "icon": "cabbage", "shelf": 10, "base_price": 1400},
        {"name": "Cauliflower", "hindi": "फूल गोभी", "category": "Vegetable", "unit": "Quintal", "icon": "cauliflower", "shelf": 7, "base_price": 1900},
        {"name": "Brinjal", "hindi": "बैंगन (Vangi)", "category": "Vegetable", "unit": "Quintal", "icon": "eggplant", "shelf": 7, "base_price": 1750},
        {"name": "Okra", "hindi": "भिंडी (Bhendi)", "category": "Vegetable", "unit": "Quintal", "icon": "okra", "shelf": 5, "base_price": 3200},
        {"name": "Green Chilli", "hindi": "हरी मिर्च", "category": "Vegetable", "unit": "Quintal", "icon": "chilli", "shelf": 12, "base_price": 4200},
        {"name": "Carrot", "hindi": "गाजर", "category": "Vegetable", "unit": "Quintal", "icon": "carrot", "shelf": 20, "base_price": 2300},
        {"name": "Cucumber", "hindi": "खीरा (Kakdi)", "category": "Vegetable", "unit": "Quintal", "icon": "cucumber", "shelf": 8, "base_price": 1600},
        {"name": "Garlic", "hindi": "लहसुन", "category": "Vegetable", "unit": "Quintal", "icon": "garlic", "shelf": 90, "base_price": 9500},
        {"name": "Ginger", "hindi": "अदरक", "category": "Vegetable", "unit": "Quintal", "icon": "ginger", "shelf": 30, "base_price": 6800},
        {"name": "Capsicum", "hindi": "शिमला मिर्च", "category": "Vegetable", "unit": "Quintal", "icon": "capsicum", "shelf": 10, "base_price": 3800},
        {"name": "Peas", "hindi": "मटर", "category": "Vegetable", "unit": "Quintal", "icon": "peas", "shelf": 6, "base_price": 4500},
        {"name": "Spinach", "hindi": "पालक", "category": "Vegetable", "unit": "Quintal", "icon": "spinach", "shelf": 3, "base_price": 1200},
        {"name": "Bottle Gourd", "hindi": "लौकी (Dudhi)", "category": "Vegetable", "unit": "Quintal", "icon": "gourd", "shelf": 12, "base_price": 1350}
    ]

    crop_objs = {}
    for c in crops_data:
        c_obj = Crop(
            name=c["name"],
            hindi_name=c["hindi"],
            category=c["category"],
            standard_unit=c["unit"],
            icon=c["icon"],
            shelf_life_days=c["shelf"]
        )
        db.add(c_obj)
        crop_objs[c["name"]] = (c_obj, c["base_price"])

    db.commit()

    # 3. Seed 30 Days of Historical & Current Market Prices for each market
    today = date.today()
    price_multipliers = {
        "Lasalgaon APMC": 1.06,
        "Nashik APMC": 1.01,
        "Pimpalgaon Baswant APMC": 1.03,
        "Yeola APMC": 0.99,
        "Pune APMC (Gultekdi)": 1.10,
        "Mumbai APMC (Vashi)": 1.18,
        "Ahmednagar APMC": 1.00,
        "Nagpur APMC": 1.04
    }

    import math
    for c_name, (crop_model, base_val) in crop_objs.items():
        for m_name, market_model in market_objs.items():
            mult = price_multipliers.get(m_name, 1.0)
            center_price = base_val * mult

            for d_offset in range(30, -1, -1):
                cur_date = today - timedelta(days=d_offset)
                # Introduce realistic slight seasonal oscillation
                wave = math.sin(d_offset * 0.25) * 0.04
                day_modal = round(center_price * (1.0 + wave), -1)
                day_min = round(day_modal * 0.88, -1)
                day_max = round(day_modal * 1.12, -1)
                arrivals = round(40 + (math.cos(d_offset * 0.4) * 15), 1)

                price_rec = MarketPrice(
                    crop_id=crop_model.id,
                    market_id=market_model.id,
                    price_date=cur_date,
                    min_price=day_min,
                    max_price=day_max,
                    modal_price=day_modal,
                    arrivals_tonnes=arrivals,
                    unit="INR/Quintal",
                    data_source="AGMARKNET / Maharashtra Mandi Gateway",
                    data_status="DEMO DATA"
                )
                db.add(price_rec)

    db.commit()

    # 4. Seed Initial Market Sync Log
    sync_log = MarketSyncLog(
        source_name="KisanNexus Calibrated Demo Engine",
        status="SUCCESS",
        records_imported=len(crop_objs) * len(market_objs) * 31,
        error_message=None,
        sync_timestamp=datetime.utcnow()
    )
    db.add(sync_log)

    # 5. Create Demo Accounts
    # 5.1 Farmer Account
    farmer_user = User(
        email="farmer@kisannexus.in",
        hashed_password=hash_password("Farmer@123"),
        full_name="Sarthak Ramesh Patil",
        phone="+91 98220 12345",
        role="Farmer",
        location="Pimpalgaon Baswant, Niphad Taluka",
        state="Maharashtra",
        district="Nashik"
    )
    db.add(farmer_user)
    db.flush()

    farmer_prof = FarmerProfile(
        user_id=farmer_user.id,
        farm_size_acres=12.5,
        primary_crops="Onion, Tomato, Capsicum",
        irrigation_type="Drip Irrigation & Farm Pond",
        upi_id="sarthakpatil@oksbi"
    )
    db.add(farmer_prof)

    # 5.2 Buyer Account
    buyer_user = User(
        email="buyer@kisannexus.in",
        hashed_password=hash_password("Buyer@123"),
        full_name="Rajesh Agarwal",
        phone="+91 94231 67890",
        role="Buyer",
        location="Market Yard, Navi Mumbai / Nashik",
        state="Maharashtra",
        district="Mumbai Suburban"
    )
    db.add(buyer_user)
    db.flush()

    buyer_prof = BuyerProfile(
        user_id=buyer_user.id,
        company_name="AgriTrade Fresh Wholesalers Pvt Ltd",
        gst_number="27AAACA1234A1Z5",
        license_number="MH-APMC-TRD-4891",
        business_type="Wholesaler & Institutional Supplier",
        verification_status="VERIFIED",
        rating=4.9,
        response_rate=98.0,
        completed_orders=148,
        trade_volume_quintals=4850.0
    )
    db.add(buyer_prof)

    # 5.3 FPO Account
    fpo_user = User(
        email="fpo@kisannexus.in",
        hashed_password=hash_password("FPO@123"),
        full_name="Sahyadri Agro Farmers Producer Co.",
        phone="+91 94222 45678",
        role="FPO",
        location="Mohadi, Dindori",
        state="Maharashtra",
        district="Nashik"
    )
    db.add(fpo_user)
    db.flush()

    fpo_prof = FPOProfile(
        user_id=fpo_user.id,
        fpo_name="Sahyadri Valley FPO Federation",
        registration_number="MH-ROC-FPO-2019-8921",
        member_count=540,
        district="Nashik",
        state="Maharashtra",
        operational_villages="Niphad, Yeola, Dindori, Pimpalgaon"
    )
    db.add(fpo_prof)

    # 5.4 Admin Account (Strictly restricted, non-publicly creatable)
    admin_user = User(
        email="admin@kisannexus.in",
        hashed_password=hash_password("Admin@123"),
        full_name="KisanNexus Administrator",
        phone="+91 99999 00000",
        role="Admin",
        location="Central Headquarters",
        state="Maharashtra",
        district="Nashik"
    )
    db.add(admin_user)
    db.flush()

    # 6. Seed Sample Crop Lots for Farmer
    onion_id = crop_objs["Onion"][0].id
    tomato_id = crop_objs["Tomato"][0].id
    potato_id = crop_objs["Potato"][0].id

    lot1 = CropLot(
        farmer_id=farmer_user.id,
        crop_id=onion_id,
        quantity_quintals=50.0,
        quality_grade="Grade A",
        variety="Nashik Red Garwa",
        expected_price=3000.0,
        location="Pimpalgaon Baswant Farm Yard",
        district="Nashik",
        state="Maharashtra",
        harvest_date=today - timedelta(days=2),
        availability_date=today,
        status="Available",
        is_flagged_suspicious=False
    )
    db.add(lot1)

    lot2 = CropLot(
        farmer_id=farmer_user.id,
        crop_id=tomato_id,
        quantity_quintals=75.0,
        quality_grade="Grade A",
        variety="Abhinav Hybrid",
        expected_price=2200.0,
        location="Niphad Village Gate",
        district="Nashik",
        state="Maharashtra",
        harvest_date=today - timedelta(days=1),
        availability_date=today,
        status="Available",
        is_flagged_suspicious=False
    )
    db.add(lot2)

    db.commit()

    # 7. Seed Buyer Requirements (Reverse Marketplace)
    req1 = BuyerRequirement(
        buyer_id=buyer_user.id,
        crop_id=onion_id,
        required_quantity=100.0,
        quality_grade="Grade A",
        region="Nashik Region (Lasalgaon / Niphad / Yeola)",
        district="Nashik",
        budget_price=3100.0,
        delivery_date=today + timedelta(days=5),
        status="Open",
        notes="Procurement for retail distribution chain. Immediate payment via escrow upon quality inspection."
    )
    db.add(req1)

    req2 = BuyerRequirement(
        buyer_id=buyer_user.id,
        crop_id=tomato_id,
        required_quantity=80.0,
        quality_grade="Grade A",
        region="Pimpalgaon / Nashik",
        district="Nashik",
        budget_price=2250.0,
        delivery_date=today + timedelta(days=3),
        status="Open",
        notes="Firm red tomatoes required for processing. Crates provided by buyer."
    )
    db.add(req2)

    # 8. Seed Initial Sample Offer
    sample_offer = Offer(
        lot_id=lot1.id,
        buyer_id=buyer_user.id,
        farmer_id=farmer_user.id,
        offered_price=2950.0,
        quantity=50.0,
        delivery_date=today + timedelta(days=2),
        notes="Ready to lift full 50 quintals lot from your farm gate. Transport arranged by us.",
        status="Pending"
    )
    db.add(sample_offer)

    # 9. Seed Price Alert for Farmer
    alert1 = PriceAlert(
        farmer_id=farmer_user.id,
        crop_id=onion_id,
        market_id=market_objs["Lasalgaon APMC"].id,
        target_price=3000.0,
        condition="GREATER_EQUAL",
        is_active=True
    )
    db.add(alert1)

    # 10. Seed Notifications
    notif1 = Notification(
        user_id=farmer_user.id,
        title="New Purchase Offer Received!",
        message="AgriTrade Fresh Wholesalers submitted an offer of ₹2,950/Quintal for your 50 Q Onion lot.",
        notification_type="OFFER",
        is_read=False,
        link="/offers"
    )
    notif2 = Notification(
        user_id=farmer_user.id,
        title="Price Alert: Lasalgaon APMC",
        message="Onion modal price at Lasalgaon reached ₹3,074/Quintal, surpassing your target ₹3,000 threshold.",
        notification_type="ALERT",
        is_read=False,
        link="/market-prices"
    )
    db.add(notif1)
    db.add(notif2)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
