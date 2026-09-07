import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import {
  Compass,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Info
} from "lucide-react";

export default function WhereShouldISellPage() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(1);
  const [quantity, setQuantity] = useState(50);
  const [location, setLocation] = useState("Nashik");
  const [qualityGrade, setQualityGrade] = useState("Grade A");
  const [sellingDate, setSellingDate] = useState(new Date().toISOString().split("T")[0]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await api.get("/crops");
      setCrops(res.data);
      if (res.data.length > 0) {
        setSelectedCrop(res.data[0].id);
        executeRecommendation(res.data[0].id, 50, "Nashik", "Grade A");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeRecommendation = async (cId, qty, loc, grade) => {
    setLoading(true);
    try {
      const res = await api.post("/recommendations/where-to-sell", {
        crop_id: cId,
        quantity_quintals: Number(qty),
        farmer_location: loc,
        quality_grade: grade
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeRecommendation(selectedCrop, quantity, location, qualityGrade);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-emerald-600" />
            AI Decision Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Where Should I Sell?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Tell us your vegetable crop, quantity, and farm location. Our AI engine computes live APMC auction rates, road freight, and buyer demand to recommend your optimal selling destination.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Vegetable
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.hindi_name || ""})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Lot Quantity (Quintals)
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Farmer Hub / Village
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Nashik">Nashik City</option>
                <option value="Niphad">Niphad Taluka</option>
                <option value="Yeola">Yeola Taluka</option>
                <option value="Dindori">Dindori Taluka</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Grade A">Grade A (Sorted / Premium)</option>
                <option value="Grade B">Grade B (Standard Marketable)</option>
                <option value="Grade C">Grade C (Commercial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Preferred Selling Date
              </label>
              <input
                type="date"
                value={sellingDate}
                onChange={(e) => setSellingDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{loading ? "Analyzing Mandis..." : "Where Should I Sell?"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* AI Recommendation Result */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Primary Spotlight Banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/20">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    RECOMMENDED BEST MARKET
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                    {result.best_market.market_name}
                  </h2>
                  <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    District: {result.best_market.district} • Estimated Distance: {result.best_market.distance_km} km
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white/10 p-4 rounded-2xl md:min-w-[320px]">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-200 uppercase block">Expected Price</span>
                    <span className="text-xl font-black text-white">₹{result.best_market.modal_price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-emerald-200 block">/ Quintal</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-200 uppercase block">Estimated Freight</span>
                    <span className="text-xl font-black text-amber-300">-₹{result.best_market.transport_cost.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-emerald-200 block">Road transit</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/20">
                    <span className="text-[10px] font-bold text-emerald-200 uppercase block">Expected Net Return</span>
                    <span className="text-2xl font-black text-white">
                      ₹{result.best_market.expected_net_return.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement 12: "WHY THIS MARKET?" Explanation */}
              <div className="pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Why {result.best_market.market_name}? (AI Explanation)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.best_market.reasons.map((r, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 text-xs font-medium leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="text-amber-300 font-extrabold text-sm">✓</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap gap-3 items-center justify-between">
                <div className="text-xs text-emerald-100 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  Active Buyer Demand: <strong className="text-white">{result.best_market.buyer_demand_level}</strong>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/create-lot"
                    className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-xs transition"
                  >
                    Create Digital Lot &rarr;
                  </Link>
                  <Link
                    to="/marketplace"
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold shadow-xs transition"
                  >
                    View Matching Buyers
                  </Link>
                </div>
              </div>
            </div>

            {/* Other Alternative Markets in Descending Order */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Other Candidate Markets (Ranked by Net Realization)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.all_markets.slice(1, 4).map((alt) => (
                  <div
                    key={alt.market_id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{alt.market_name}</h4>
                        <span className="text-[10px] text-slate-600 font-mono">{alt.distance_km} km</span>
                      </div>
                      <div className="text-lg font-black text-slate-800">
                        ₹{alt.expected_net_return.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-600 block">Expected Net Return</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      Transport: ₹{alt.transport_cost.toLocaleString("en-IN")} | Demand: {alt.buyer_demand_level}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Notice:</strong> {result.disclaimer}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

