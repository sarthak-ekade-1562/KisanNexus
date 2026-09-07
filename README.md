# KisanNexus (किसाननेक्सस)
### AI-Powered Agricultural Market Intelligence & Smart Trading Platform
**Smart India Hackathon (SIH) Problem Statement 26132**  
*“Strengthening Market Linkages and Price Discovery for Farmers”*

---

## 1. Executive Summary & Core Value Proposition

Indian farmers frequently face severe price volatility, intermediary exploitation, lack of visibility into regional Mandi auctions, and distress selling. 

**KisanNexus** transforms raw market prices into practical, profitable selling decisions by directly answering three vital questions:
1. **WHERE should I sell?**  
   - Dynamically evaluates candidate APMCs, deducts real-time road freight, mandi handling cess, and highlights the **Highest Expected Net Return**.
2. **WHEN should I sell?**  
   - Analyzes historical 7-day and 30-day moving price trends and arrival volumes to generate a 7-day predictive price corridor with a transparent **Sell Now vs. Consider Waiting** momentum advisory.
3. **TO WHOM should I sell?**  
   - Provides a verified B2B Buyer Marketplace with an **AI Smart Compatibility Match Score (0–100%)**, reverse procurement tenders, multi-round negotiation counter-offers, and digital escrow milestone tracking.

---

## 2. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | Ultra-responsive, mobile-first agricultural dashboard |
| **Routing & UI** | React Router Dom 7, Lucide Icons | Smooth client navigation & high-contrast accessibility |
| **Data Viz** | Recharts | Interactive 7d/30d moving price curves & forecast corridor |
| **Backend API** | Python 3.12, FastAPI | Asynchronous high-throughput REST APIs with auto Swagger docs |
| **Data & ORM** | SQLAlchemy 2.0, SQLite (PostgreSQL-Ready) | Zero-friction local run with migration-ready relational schema |
| **Security** | PBKDF2-HMAC-SHA256, PyJWT | Salted password hashing, JWT Bearer RBAC (4 roles) |
| **External Feeds** | HTTPX, Resilient Dual-Mode Adapter | AGMARKNET / data.gov.in integration with demo fallback |

---

## 3. System Architecture & Folder Structure

```
kisannexus/
├── backend/
│   ├── app/
│   │   ├── api/                     # REST API Route Controllers
│   │   │   ├── auth.py              # Register, Login, Me, Password Reset
│   │   │   ├── market_prices.py     # Mandi rates query, filter, sync
│   │   │   ├── recommendations.py   # "Where to Sell?" & Net Profit Engine
│   │   │   ├── predictions.py       # Time-series trends & Sell Now vs Wait
│   │   │   ├── lots.py              # Digital Crop Lots & Anomaly Check
│   │   │   ├── buyers.py            # Reverse Marketplace & Buyer Demands
│   │   │   ├── matching.py          # Smart Farmer-Buyer Compatibility Engine
│   │   │   ├── offers.py            # Negotiation timeline & Counter-Offers
│   │   │   ├── transactions.py      # Escrow tracking & Order Lifecycle
│   │   │   ├── price_alerts.py      # Target price threshold alerts
│   │   │   ├── notifications.py     # In-app real-time alerts
│   │   │   ├── weather.py           # Agro weather & transit advisories
│   │   │   ├── advisor.py           # Grounded AI Market Advisor Assistant
│   │   │   ├── fpo.py               # FPO bulk aggregation & group contracts
│   │   │   └── admin.py             # Admin metrics, verification & data sync
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic BaseSettings & Environment vars
│   │   │   ├── security.py          # Salted password hashing & JWT handlers
│   │   │   └── dependencies.py      # Auth guards & Role-based dependencies
│   │   ├── database/
│   │   │   ├── session.py           # SQLAlchemy Engine & SessionLocal
│   │   │   └── seed_data.py         # Realistic Maharashtra Mandi & User Seed
│   │   ├── models/
│   │   │   └── models.py            # Relational SQLAlchemy database models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic validation request/response schemas
│   │   ├── services/
│   │   │   ├── market_price_service.py # API sync layer with demo fallback
│   │   │   ├── recommendation_service.py # Road distance freight & net profit
│   │   │   ├── prediction_service.py   # 7-day price corridor & momentum signal
│   │   │   ├── matching_service.py     # 4-factor farmer-buyer matching engine
│   │   │   ├── anomaly_service.py      # Suspicious price anomaly detection (>40%)
│   │   │   └── weather_service.py      # Agro weather & harvest/transit advice
│   │   └── main.py                  # FastAPI bootstrap & CORS middleware
│   ├── tests/
│   │   ├── test_backend.py          # Pytest suite for core endpoints
│   │   ├── test_trade_matching.py   # End-to-end matching & negotiation tests
│   │   └── run_demo_e2e.ps1         # Complete 20-step demonstration script
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/client.js            # Axios client with JWT interceptors
│   │   ├── context/AuthContext.jsx  # Global session & authentication state
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Role-based navigation & notification bell
│   │   │   ├── Footer.jsx           # SIH disclaimer & transparency badge
│   │   │   ├── ProtectedRoute.jsx   # Role-guarded route wrapper
│   │   │   └── AIAdvisorChat.jsx    # Grounded interactive AI Advisor widget
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # SIH showcase, 3 questions, live ticker
│   │   │   ├── LoginPage.jsx        # Login + One-click demo credentials
│   │   │   ├── RegisterPage.jsx     # Role-based onboarding (Farmer, Buyer, FPO)
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── MarketPricesPage.jsx # "Live Vegetable Market Prices" dashboard
│   │   │   ├── MarketComparisonPage.jsx # Mandi comparison + Net Profit Calculator
│   │   │   ├── WhereShouldISellPage.jsx # AI "Where Should I Sell?" core engine
│   │   │   ├── PriceTrendsPage.jsx  # Recharts 7d/30d trends + Sell Now vs Wait
│   │   │   ├── FarmerDashboard.jsx  # Farmer command hub, weather & offers
│   │   │   ├── CreateLotPage.jsx    # Digital lot listing + anomaly price warning
│   │   │   ├── BuyerMarketplacePage.jsx # Buyer browsing & sending purchase bids
│   │   │   ├── BuyerRequirementsPage.jsx # Reverse marketplace for procurement
│   │   │   ├── OffersPage.jsx       # Negotiation hub & counter-offers
│   │   │   ├── TransactionsPage.jsx # Order dispatch & escrow release tracking
│   │   │   ├── PriceAlertsPage.jsx  # Real-time price threshold subscriptions
│   │   │   ├── FPODashboard.jsx     # FPO member aggregation & bulk logistics
│   │   │   └── AdminDashboard.jsx   # Admin sync monitor, buyer verification
│   │   ├── App.jsx
│   │   └── index.css                # Tailwind CSS v4 styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
└── README.md
```

---

## 4. User Roles & Pre-Seeded Demo Accounts

KisanNexus features role-based access control across four distinct user groups:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@kisannexus.in` | `Farmer@123` | Mandi prices, Where to sell, Net profit calculator, Create lots, Price alerts, Negotiate offers, Order tracking |
| **Buyer / Trader** | `buyer@kisannexus.in` | `Buyer@123` | Browse lots, Smart compatibility matching, Send purchase bids, Post reverse procurement demands, Track shipments |
| **FPO / Farmer Group** | `fpo@kisannexus.in` | `FPO@123` | Aggregate member crop volume, Bulk collective lots, Full-truck freight savings analysis, Institutional contracts |
| **Admin** | `admin@kisannexus.in` | `Admin@123` | Trigger Mandi API sync, Verify buyers, Review suspicious price anomalies, Manual verified rate entry |

> [!NOTE]
> For instant evaluation, the **Login page** includes dedicated **"Quick One-Click Demo Login"** buttons to switch roles effortlessly. Admin accounts **cannot** be created publicly.

---

## 5. Dual-Mode Market Price Architecture & Fallback

KisanNexus is engineered for official agricultural data pipelines (such as `data.gov.in`, `AGMARKNET`, or `eNAM`):

1. **Configured API Key**:  
   If `MARKET_API_URL` and `MARKET_API_KEY` are provided in `.env`, the backend connects to the live API endpoints, ingests current auction bids, and flags records as `LIVE / VERIFIED DATA`.
2. **Missing Key / Upstream Outage**:  
   If credentials are not set or the upstream API fails/times out, the system automatically falls back to **calibrated baseline demo records** and clearly badges them as `DEMO DATA`.
3. **Admin Transparency**:  
   The Admin Portal tracks API connection status, records imported, last sync timestamp, and includes a **"Sync Market Data Now"** trigger.
4. **Data Integrity & Manual Overrides**:  
   Admins can record field-verified prices, which are uniquely tagged with `ADMIN VERIFIED`.

---

## 6. Local Setup Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database (APMC Mandis, 16 vegetables, 30 days of prices, demo users)
python -m app.database.seed_data

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API documentation is available at `http://127.0.0.1:8000/docs` and `/redoc`.*

### Frontend Setup
```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev -- --port 5173
```
*Open your browser at `http://localhost:5173`.*

---

## 7. Automated Testing Suite

KisanNexus comes with a comprehensive backend pytest test suite and an automated 20-step end-to-end verification script:

```bash
# Run pytest backend unit and integration tests
cd backend
python -m pytest tests/ -v
```

```powershell
# Run the complete 20-step End-to-End Trade & Negotiation Workflow
powershell -ExecutionPolicy Bypass -File "backend\tests\run_demo_e2e.ps1"
```

---

## 8. Complete 20-Step End-to-End Demo Workflow

To experience the platform's full capabilities during a live demonstration:

1. **Sign In**: Navigate to `/login` and click **"🌾 Farmer Patil"** to log in as the pre-seeded Nashik farmer.
2. **Explore Mandi Prices**: Visit **Mandi Prices** (`/market-prices`) and observe live rate cards for Onion, Tomato, Potato, Cabbage, Chilli, etc., marked with `DEMO DATA` or `LIVE / VERIFIED DATA`.
3. **Compare Mandis**: Go to **Compare Markets** (`/compare-markets`), enter `50 Quintals` of `Onion` from `Nashik`.
4. **Inspect Deductions**: View the side-by-side comparison of Nashik APMC, Lasalgaon APMC, Yeola APMC, Pimpalgaon APMC, Pune APMC, and Mumbai APMC. Notice how road distance, transport freight, and mandi cess are deducted from gross revenue to calculate **Expected Net Return**.
5. **AI "Where Should I Sell?"**: Click **"Where Should I Sell?"** (`/where-to-sell`) to view the top recommended destination with a transparent **"Why this market?"** checklist (e.g. price advantage, distance balance, buyer liquidity).
6. **Evaluate Price Trends**: Navigate to **Price Trends** (`/price-trends`) to examine the 7-day / 30-day moving average chart and the AI price prediction corridor.
7. **Sell Now vs. Wait**: Review the AI recommendation verdict (**"SELL NOW"** or **"CONSIDER WAITING"**) with transparent momentum signals.
8. **Create a Digital Lot**: Go to **Farmer Hub** &rarr; **Add Lot** (`/create-lot`). Enter 50 Quintals of Grade A Onion at ₹2,950/Q. Note the anomaly detection engine verifying price reasonableness.
9. **Switch to Buyer**: Log out and log in as **"🏢 Verified Buyer"** (`buyer@kisannexus.in`).
10. **Browse Marketplace**: Visit **Buyer Marketplace** (`/marketplace`). Observe the **Smart Compatibility Match Score (92% Match)** and reason checklist.
11. **Submit Purchase Offer**: Click **"Send Offer"** on Farmer Patil's lot, offering ₹2,900/Q for 50 Quintals with farm-gate pickup terms.
12. **Farmer Notification**: Log back in as Farmer Patil. Notice the **Notification Bell** badge updating with the new purchase bid.
13. **Counter-Offer Negotiation**: Go to **Offers** (`/offers`), review the buyer's bid, click **"Counter Offer"**, and propose ₹2,925/Q.
14. **Accept & Lock Deal**: Switch back to Buyer, review the countered price in the negotiation timeline, and click **"Accept & Lock Deal"**.
15. **Automated Order & Escrow**: Navigate to **Transactions** (`/transactions`). An official order is created with milestone escrow tracking (`Escrow_Held`) and a unique tracking number (`KNX-TXN-XXXX`).
16. **Track Shipment**: Advance the order status from `Confirmed` to `In_Transit` to `Delivered`.
17. **Release Payment**: Release the escrow funds upon yard inspection to mark the transaction as `Completed`.
18. **FPO Collective Hub**: Sign in as **"🚜 FPO Federation"** (`fpo@kisannexus.in`) to view aggregated member crop pools, bulk volume statistics, and estimated bulk freight savings (18.5%).
19. **Ask AI Market Advisor**: Open the floating **"Ask Kisan AI"** widget at the bottom right. Ask: *"Which market is better for my onion in Nashik?"* to observe grounded advice referencing current database rates.
20. **Admin Desk Oversight**: Log in as **"🛡️ System Admin"** (`admin@kisannexus.in`) to review platform metrics, verify traders, test the manual **"Sync Market Data Now"** button, and manage price anomaly flags.

---

## 9. Cloud Deployment Guide (Render / Railway / Cloud VM)

The application is structured to be cloud deployable without GitHub Pages limitations:

### Production Environment Variables
```env
DATABASE_URL=postgresql://user:password@hostname:5432/kisannexus
JWT_SECRET=your_production_secure_secret_key
MARKET_API_URL=https://api.data.gov.in/resource/...
MARKET_API_KEY=your_official_datagov_api_key
WEATHER_API_KEY=your_openweathermap_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Backend (Web Service)
- **Build Command**: `pip install -r requirements.txt && python -m app.database.seed_data`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Static Site / Web Service)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: `VITE_API_BASE_URL=https://your-backend-domain.com/api`

---

## 10. License & Acknowledgement

Developed for **Smart India Hackathon (SIH) Problem Statement 26132**.  
Dedicated to empowering Indian farmers with transparent market linkages, transport-aware price discovery, and fair direct trade.
