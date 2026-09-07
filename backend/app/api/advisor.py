from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import MarketPrice, Crop, Market
from app.schemas.schemas import AdvisorQuestionRequest, AdvisorAnswerResponse

router = APIRouter(prefix="/advisor", tags=["AI Market Advisor"])

@router.post("/ask", response_model=AdvisorAnswerResponse)
def ask_market_advisor(
    req: AdvisorQuestionRequest,
    db: Session = Depends(get_db)
):
    q = req.question.strip().lower()
    crop_filter = req.crop or ("onion" if "onion" in q or "kanda" in q else ("tomato" if "tomato" in q else None))

    # Pull latest market prices for context
    prices_query = db.query(MarketPrice).join(Crop).join(Market)
    if crop_filter:
        prices_query = prices_query.filter(Crop.name.ilike(f"%{crop_filter}%"))
    
    top_prices = prices_query.order_by(desc(MarketPrice.modal_price)).limit(5).all()

    context_snippets = [
        f"{p.market.name}: ₹{p.modal_price:,.0f}/Q (Range: ₹{p.min_price:,.0f} - ₹{p.max_price:,.0f})"
        for p in top_prices
    ]

    # Grounded rule-based intelligent response engine
    if "where" in q or "which market" in q or "better" in q:
        if top_prices:
            best = top_prices[0]
            answer = (
                f"Based on current reported arrivals and prices for {best.crop.name}, **{best.market.name}** "
                f"is leading with a modal rate of **₹{best.modal_price:,.0f}/Quintal**.\n\n"
                f"However, before dispatching, factor in the net transport tariff: if you are located in or near Niphad/Nashik, "
                f"Lasalgaon APMC and Pimpalgaon Baswant offer high buyer density and lower per-quintal freight. "
                f"Use our **Market Comparison** tool to compute exact road freight deductions before finalizing."
            )
        else:
            answer = "Currently, Lasalgaon and Pimpalgaon Baswant APMCs offer the highest liquidity and competitive bidding for Maharashtra produce."

    elif "when" in q or "wait" in q or "sell now" in q:
        answer = (
            "Evaluating whether to sell today or hold depends on produce perishability and recent price momentum:\n"
            "1. **Perishable vegetables (Tomato, Cabbage, Okra)**: Sell promptly upon reaching optimal maturity; holding in non-cold storage causes 4-7% weight shrinkage and grade degradation.\n"
            "2. **Semi-perishables (Onion, Garlic, Potato)**: Check our **Price Trends** page. If the 7-day moving average is advancing and arrivals are steady, holding for 3-5 days in dry aeration sheds can capture higher modal realization."
        )

    elif "factor" in q or "affect" in q or "why" in q:
        answer = (
            "Today's mandi price discovery is determined by 4 key dynamic drivers:\n"
            "- **Daily Arrival Tonnage**: High vehicle queues at APMC gates soften opening auction bids.\n"
            "- **Outstation Demand**: Inflow of truck aggregators and buyers heading to Delhi, Kolkata, and South India.\n"
            "- **Produce Moisture & Quality Grade**: Grade A sorting yields up to a 6-10% price premium over ungraded lots.\n"
            "- **Weather & Transit Conditions**: Favorable dry road conditions minimize transport delay penalties."
        )

    elif "buyer" in q or "whom" in q or "offer" in q:
        answer = (
            "To maximize realization, avoid distress sales to unverified middlemen:\n"
            "- Check the **Buyer Marketplace** on KisanNexus to connect directly with Verified Institutional Buyers.\n"
            "- Compare buyer farm-gate offers with APMC net returns (after deducting mandi cess and loading charges).\n"
            "- Always utilize KisanNexus digital contracts and Escrow tracking to secure timely payment."
        )

    else:
        answer = (
            f"KisanNexus intelligence indicates active trading across Maharashtra APMCs today. "
            f"Key benchmark rates recorded: {', '.join(context_snippets[:3])}. "
            f"For customized advice, enter your harvest quantity and location in the 'Where Should I Sell?' module."
        )

    return {
        "question": req.question,
        "answer": answer,
        "context_used": context_snippets,
        "disclaimer": "AI Market Advisor provides informational market intelligence based on reported mandi transactions. It is not guaranteed financial advice."
    }
