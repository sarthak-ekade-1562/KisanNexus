from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_trade_and_matching_workflow():
    # 1. Login as Farmer
    farmer_resp = client.post("/api/auth/login", json={
        "email": "farmer@kisannexus.in",
        "password": "Farmer@123"
    })
    assert farmer_resp.status_code == 200
    farmer_token = farmer_resp.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # 2. Farmer creates a new crop lot
    crops = client.get("/api/crops").json()
    onion_id = [c["id"] for c in crops if c["name"] == "Onion"][0]

    lot_resp = client.post("/api/lots", json={
        "crop_id": onion_id,
        "quantity_quintals": 60.0,
        "quality_grade": "Grade A",
        "variety": "Garwa Special",
        "expected_price": 2950.0,
        "location": "Lasalgaon Road Farm",
        "district": "Nashik",
        "state": "Maharashtra"
    }, headers=farmer_headers)
    assert lot_resp.status_code == 200
    lot = lot_resp.json()
    lot_id = lot["id"]
    assert lot["is_flagged_suspicious"] == False

    # 3. Test matching engine for this lot
    match_resp = client.get(f"/api/matching/lot/{lot_id}")
    assert match_resp.status_code == 200
    match_data = match_resp.json()
    assert "matches" in match_data
    if len(match_data["matches"]) > 0:
        assert match_data["matches"][0]["match_score"] > 50

    # 4. Login as Buyer
    buyer_resp = client.post("/api/auth/login", json={
        "email": "buyer@kisannexus.in",
        "password": "Buyer@123"
    })
    assert buyer_resp.status_code == 200
    buyer_token = buyer_resp.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 5. Buyer sends offer on Farmer's lot
    offer_resp = client.post("/api/offers", json={
        "lot_id": lot_id,
        "offered_price": 2900.0,
        "quantity": 60.0,
        "notes": "Fast payment via Escrow upon arrival"
    }, headers=buyer_headers)
    assert offer_resp.status_code == 200
    offer = offer_resp.json()
    offer_id = offer["id"]
    assert offer["status"] == "Pending"

    # 6. Farmer receives offer and counters it
    counter_resp = client.post(f"/api/offers/{offer_id}/counter", json={
        "counter_price": 2925.0,
        "message": "Can meet at 2925 for full 60 quintals"
    }, headers=farmer_headers)
    assert counter_resp.status_code == 200
    countered = counter_resp.json()
    assert countered["status"] == "Countered"
    assert countered["offered_price"] == 2925.0

    # 7. Buyer accepts the countered offer
    accept_resp = client.post(f"/api/offers/{offer_id}/accept", headers=buyer_headers)
    assert accept_resp.status_code == 200
    accepted = accept_resp.json()
    assert accepted["status"] == "Accepted"

    # 8. Verify transaction was generated
    txns_resp = client.get("/api/transactions", headers=farmer_headers)
    assert txns_resp.status_code == 200
    txns = txns_resp.json()
    assert len(txns) > 0
    txn = [t for t in txns if t["offer_id"] == offer_id][0]
    assert txn["agreed_price"] == 2925.0
    assert txn["quantity"] == 60.0
    assert txn["payment_status"] == "Escrow_Held"
    assert txn["order_status"] == "Confirmed"
