import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  ArrowRight,
  TrendingUp,
  Scale,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  BarChart2
} from "lucide-react";

export default function LandingPage() {
  const [topPrices, setTopPrices] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    fetchLiveSnapshot();
  }, []);

  const fetchLiveSnapshot = async () => {
    try {
      const [priceRes, statusRes] = await Promise.all([
        api.get("/market-prices?limit=8"),
        api.get("/market-prices/status")
      ]);
      setTopPrices(priceRes.data);
      setSyncStatus(statusRes.data);
    } catch (err) {
      console.error("Error loading snapshot:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Live Ticker Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              {syncStatus?.data_status_mode || "MANDI INTELLIGENCE ACTIVE"}
            </span>
            <span className="hidden md:inline text-emerald-300">
              | Official AGMARKNET / State APMC Architecture Ready
            </span>
          </div>
          <div className="text-[11px] text-emerald-200">
            Source: {syncStatus?.data_source || "Mandi Gateway"} • Updated Daily
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-emerald-50/40 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              SIH Problem Statement 26132
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Better Markets. Better Decisions.{" "}
              <span className="text-emerald-600 block sm:inline">Better Returns.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Helping farmers discover better markets, reliable buyers and smarter selling opportunities
              by answering the three vital questions:{" "}
              <span className="font-semibold text-slate-800">Where to sell</span>,{" "}
              <span className="font-semibold text-slate-800">When to sell</span>, and{" "}
              <span className="font-semibold text-slate-800">To whom to sell</span>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/where-to-sell"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Where Should I Sell?</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/market-prices"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-base shadow-xs transition-all flex items-center justify-center"
              >
                Explore Mandi Prices
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-2xl font-black text-emerald-600">8+</div>
                <div className="text-xs font-medium text-slate-600">Maharashtra APMCs</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-2xl font-black text-emerald-600">16+</div>
                <div className="text-xs font-medium text-slate-600">Vegetables Monitored</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-2xl font-black text-emerald-600">₹ Net</div>
                <div className="text-xs font-medium text-slate-600">Transport-Deducted Return</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-2xl font-black text-emerald-600">100%</div>
                <div className="text-xs font-medium text-slate-600">Transparent AI Reasons</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Questions Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-2">
              Transforming Mandi Data Into Action
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Answering The Three Vital Questions For Every Farmer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: WHERE */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-600/20">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                WHERE should I sell?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Don't simply look at top auction quotes. We compare candidate APMCs, deduct estimated road transport freight, hamali, and mandi fees to highlight your true <strong>Highest Net Return</strong>.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Distance & Vehicle Freight calculation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandi cess & handling cost deduction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Clear "BEST MARKET" recommendation
                </li>
              </ul>
              <Link
                to="/where-to-sell"
                className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Run Market Comparison &rarr;
              </Link>
            </div>

            {/* Card 2: WHEN */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50/60 to-white border border-teal-200 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-teal-600/20">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                WHEN should I sell?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Avoid distress liquidation during sudden arrival gluts. Our AI analyzes historical price trends, volatility, and arrival volumes to provide a transparent <strong>Sell Now vs. Wait</strong> advisory.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  7-Day & 30-Day moving price trends
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  AI Price Prediction corridor with confidence %
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Sell Now or Consider Waiting momentum signals
                </li>
              </ul>
              <Link
                to="/price-trends"
                className="text-teal-700 font-bold text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Inspect Price Trends &rarr;
              </Link>
            </div>

            {/* Card 3: TO WHOM */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200 hover:shadow-lg transition-all relative group">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-amber-600/20">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                TO WHOM should I sell?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Bypass exploitative unverified intermediaries. Connect directly with Verified Buyers, browse reverse procurement tenders, negotiate multi-round offers, and track escrow payments.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  GST-Verified Buyer profiles & ratings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  AI Smart Compatibility Match Score (%)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Offers, Counter-Offers, and Escrow tracking
                </li>
              </ul>
              <Link
                to="/marketplace"
                className="text-amber-700 font-bold text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Browse Buyer Marketplace &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Snapshot Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                <span>Vegetable Mandi Monitor</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                  {syncStatus?.data_status_mode || "DEMO DATA"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Current Mandi Prices Snapshot
              </h2>
            </div>
            <Link
              to="/market-prices"
              className="mt-3 md:mt-0 text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View Full Price Board (16+ Vegetables) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topPrices.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{p.crop_name}</h4>
                    <span className="text-xs text-slate-600">{p.hindi_name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {p.data_status}
                  </span>
                </div>

                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900">
                    ₹{p.modal_price.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-slate-600 ml-1">/ Quintal</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex justify-between">
                    <span>Min: ₹{p.min_price.toLocaleString("en-IN")}</span>
                    <span>Max: ₹{p.max_price.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-medium text-slate-700 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{p.market_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{p.district}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIH Callout Banner */}
      <section className="py-12 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex items-center justify-between">
          <div className="max-w-2xl mb-6 sm:mb-0">
            <h3 className="text-2xl font-black tracking-tight">
              Empowering Indian Agriculture with Grounded Tech
            </h3>
            <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
              KisanNexus does not merely display static prices. It turns market intelligence into actionable, profitable selling decisions for farmers, FPOs, and traders.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-block px-6 py-3 rounded-xl bg-white text-emerald-800 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition"
          >
            Create Free Account &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
