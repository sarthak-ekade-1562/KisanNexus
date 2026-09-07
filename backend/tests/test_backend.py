import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["project"] == "KisanNexus"
    
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_login_farmer():
    resp = client.post("/api/auth/login", json={
        "email": "farmer@kisannexus.in",
        "password": "Farmer@123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Farmer"

def test_login_buyer():
    resp = client.post("/api/auth/login", json={
        "email": "buyer@kisannexus.in",
        "password": "Buyer@123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["role"] == "Buyer"
    assert data["user"]["buyer_profile"]["verification_status"] == "VERIFIED"

def test_login_admin():
    resp = client.post("/api/auth/login", json={
        "email": "admin@kisannexus.in",
        "password": "Admin@123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["role"] == "Admin"

def test_admin_public_registration_blocked():
    resp = client.post("/api/auth/register", json={
        "email": "fakeadmin@kisannexus.in",
        "password": "FakePassword123",
        "full_name": "Fake Admin",
        "role": "Admin"
    })
    assert resp.status_code == 403

def test_get_crops_and_markets():
    crops_resp = client.get("/api/crops")
    assert crops_resp.status_code == 200
    crops = crops_resp.json()
    assert len(crops) >= 15
    crop_names = [c["name"] for c in crops]
    assert "Onion" in crop_names
    assert "Tomato" in crop_names

    markets_resp = client.get("/api/markets")
    assert markets_resp.status_code == 200
    markets = markets_resp.json()
    assert len(markets) >= 8
    market_names = [m["name"] for m in markets]
    assert "Lasalgaon APMC" in market_names
    assert "Nashik APMC" in market_names

def test_market_prices_and_status():
    prices_resp = client.get("/api/market-prices")
    assert prices_resp.status_code == 200
    prices = prices_resp.json()
    assert len(prices) > 0
    # Verify proper data_status label
    assert prices[0]["data_status"] in ["DEMO DATA", "LIVE / VERIFIED DATA", "ADMIN VERIFIED"]

    status_resp = client.get("/api/market-prices/status")
    assert status_resp.status_code == 200
    stat = status_resp.json()
    assert "data_status_mode" in stat

def test_where_should_i_sell_recommendation():
    crops = client.get("/api/crops").json()
    onion_id = [c["id"] for c in crops if c["name"] == "Onion"][0]

    req_payload = {
        "crop_id": onion_id,
        "quantity_quintals": 50.0,
        "farmer_location": "Nashik",
        "quality_grade": "Grade A"
    }
    resp = client.post("/api/recommendations/where-to-sell", json=req_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop_name"] == "Onion"
    assert "best_market" in data
    assert data["best_market"]["is_best_market"] == True
    assert len(data["best_market"]["reasons"]) > 0
    assert len(data["all_markets"]) > 1

def test_net_profit_calculator():
    resp = client.post("/api/recommendations/net-profit", json={
        "market_price": 3000.0,
        "quantity_quintals": 50.0,
        "transport_cost": 7500.0,
        "handling_and_other_costs": 3000.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["gross_revenue"] == 150000.0
    assert data["expected_net_return"] == 139500.0

def test_price_prediction_and_forecast():
    crops = client.get("/api/crops").json()
    onion_id = [c["id"] for c in crops if c["name"] == "Onion"][0]
    markets = client.get("/api/markets").json()
    lasalgaon_id = [m["id"] for m in markets if "Lasalgaon" in m["name"]][0]

    resp = client.get(f"/api/predictions/forecast?crop_id={onion_id}&market_id={lasalgaon_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert "predicted_modal_price" in data
    assert data["recommendation"] in ["SELL NOW", "CONSIDER WAITING"]
    assert len(data["decision_reasons"]) > 0

def test_weather_endpoint():
    resp = client.get("/api/weather?location=Nashik")
    assert resp.status_code == 200
    data = resp.json()
    assert data["location"] == "Nashik"
    assert data["data_status"] in ["LIVE WEATHER DATA", "DEMO WEATHER DATA"]
    assert len(data["forecast_5day"]) == 5

def test_advisor_ask():
    resp = client.post("/api/advisor/ask", json={
        "question": "Which market is better for my onion in Nashik?",
        "crop": "Onion"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "Lasalgaon" in data["answer"] or "mandi" in data["answer"].lower()
    assert "disclaimer" in data
