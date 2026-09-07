import React, { useState, useEffect } from "react";
import api from "../api/client";
import {
  Scale,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calculator,
  MapPin,
  HelpCircle
} from "lucide-react";

export default function MarketComparisonPage() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(1);
  const [quantity, setQuantity] = useState(50);
  const [location, setLocation] = useState("Nashik");
  const [grade, setGrade] = useState("Grade A");

  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom Profit Calculator states
  const [customPrice, setCustomPrice] = useState(3000);
  const [customQty, setCustomQty] = useState(50);
  const [customTransport, setCustomTransport] = useState(7500);
  const [customOther, setCustomOther] = useState(3000);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await api.get("/crops");
      setCrops(res.data);
      if (res.data.length > 0) {
        setSelectedCrop(res.data[0].id);
        runComparison(res.data[0].id, 50, "Nashik", "Grade A");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runComparison = async (cId, qty, loc, grd) => {
    setLoading(true);
    try {
      const res = await api.post("/recommendations/where-to-sell", {
        crop_id: cId,
        quantity_quintals: Number(qty),
        farmer_location: loc,
        quality_grade: grd
      });
      setComparisonResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runComparison(selectedCrop, quantity, location, grade);
  };

  const calculateCustomNet = async () => {
    try {
      const res = await api.post("/recommendations/net-profit", {
        market_price: Number(customPrice),
        quantity_quintals: Number(customQty),
        transport_cost: Number(customTransport),
        handling_and_other_costs: Number(customOther)
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    calculateCustomNet();
  }, [customPrice, customQty, customTransport, customOther]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mandi Comparison & Net Return Engine
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Evaluates candidate APMCs, deducts road transit tariffs & mandi fees to uncover your highest true net revenue.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Sort Criteria
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              Highest Expected Net Return
            </span>
          </div>
        </div>

        {/* Input Controls Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Crop
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                Quantity (Quintals)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Farmer Hub / Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Grade A">Grade A (Premium / Sorted)</option>
                <option value="Grade B">Grade B (Standard Marketable)</option>
                <option value="Grade C">Grade C (Commercial / Mixed)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>{loading ? "Calculating..." : "Compare Markets"}</span>
            </button>
          </form>
        </div>

        {/* Results Presentation */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Primary BEST MARKET Spotlight */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-6 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wider uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Best Market
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                    {comparisonResult.best_market.market_name}
                  </h2>
                  <p className="text-xs text-emerald-100 mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {comparisonResult.best_market.district}, Maharashtra • Road Distance:{" "}
                    <strong>{comparisonResult.best_market.distance_km} km</strong> from {comparisonResult.farmer_location}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
                    Expected Net Return
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    ₹{comparisonResult.best_market.expected_net_return.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-emerald-200 font-medium">
                    (After ₹{comparisonResult.best_market.transport_cost.toLocaleString("en-IN")} transport + ₹
                    {comparisonResult.best_market.handling_and_cess.toLocaleString("en-IN")} fees)
                  </span>
                </div>
              </div>

              {/* Transparent "Why this market?" Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Why {comparisonResult.best_market.market_name}? (Transparent Justification)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {comparisonResult.best_market.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-white/10 rounded-xl p-3 text-xs leading-relaxed font-medium"
                    >
                      <span className="text-amber-300 font-bold">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Multi-Market Comparison Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Candidate Mandis Ranked By Expected Net Return
                  </h3>
                  <p className="text-xs text-slate-600">
                    Comparing realization for {comparisonResult.quantity_quintals} Quintals of {comparisonResult.crop_name} ({comparisonResult.quality_grade})
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Market / Mandi</th>
                      <th className="py-3.5 px-4 text-right">Distance</th>
                      <th className="py-3.5 px-4 text-right">Mandi Rate</th>
                      <th className="py-3.5 px-4 text-right">Gross Value</th>
                      <th className="py-3.5 px-4 text-right text-red-600">Estimated Transport</th>
                      <th className="py-3.5 px-4 text-right text-slate-600">Cess & Handling</th>
                      <th className="py-3.5 px-4 text-right font-black text-emerald-800 text-sm">
                        Expected Net Return
                      </th>
                      <th className="py-3.5 px-4 text-center">Liquidity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {comparisonResult.all_markets.map((m, idx) => (
                      <tr
                        key={m.market_id}
                        className={`hover:bg-slate-50 transition ${
                          m.is_best_market ? "bg-emerald-50/60 font-semibold" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {m.is_best_market && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                                BEST
                              </span>
                            )}
                            <span className="font-bold text-slate-900">{m.market_name}</span>
                          </div>
                          <span className="text-[10px] text-slate-600">{m.district}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">{m.distance_km} km</td>
                        <td className="py-3.5 px-4 text-right font-mono">₹{m.modal_price.toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          ₹{m.gross_revenue.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-red-600">
                          - ₹{m.transport_cost.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          - ₹{m.handling_and_cess.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                          ₹{m.expected_net_return.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.buyer_demand_level === "High"
                                ? "bg-emerald-100 text-emerald-800"
                                : m.buyer_demand_level === "Moderate"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {m.buyer_demand_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
                <strong>Disclaimer:</strong> {comparisonResult.disclaimer}
              </div>
            </div>
          </div>
        )}

        {/* Smart Net Profit Calculator Interactive Module (Requirement 10) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Smart Net Profit Calculator
              </h3>
              <p className="text-xs text-slate-600">
                Formula: Expected Gross Revenue = Market Price × Quantity | Expected Net Return = Gross Revenue - Transport - Mandi Costs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Market Price (₹ per Quintal)
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lot Quantity (Quintals)
                </label>
                <input
                  type="number"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Transport Freight Cost (₹)
                </label>
                <input
                  type="number"
                  value={customTransport}
                  onChange={(e) => setCustomTransport(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mandi Fee / Hamali / Other Expenses (₹)
                </label>
                <input
                  type="number"
                  value={customOther}
                  onChange={(e) => setCustomOther(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Visual Calculation Output */}
            {calcResult && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Calculated Breakdown
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Gross Revenue (Price × Qty):</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{calcResult.gross_revenue.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200 text-red-600">
                    <span>- Transport Freight Expense:</span>
                    <span className="font-bold font-mono">
                      ₹{calcResult.transport_cost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200 text-red-600">
                    <span>- APMC Cess & Handling:</span>
                    <span className="font-bold font-mono">
                      ₹{calcResult.handling_and_other_costs.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 text-lg font-black text-emerald-800">
                    <span>Expected Net Return:</span>
                    <span className="font-mono text-2xl">
                      ₹{calcResult.expected_net_return.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="text-right text-xs font-semibold text-emerald-700">
                    Net Profit Margin: {calcResult.net_margin_percent}%
                  </div>
                </div>

                <div className="p-3 bg-emerald-100/70 rounded-xl text-xs text-emerald-900 leading-relaxed">
                  💡 <strong>Insight:</strong> For 50 Quintals, a ₹150/Q higher price in Lasalgaon yields an extra ₹7,500 gross, easily compensating for a ₹2,000 higher transport tariff.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
