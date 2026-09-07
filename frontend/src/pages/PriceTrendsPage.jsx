import React, { useState, useEffect } from "react";
import api from "../api/client";
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export default function PriceTrendsPage() {
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(1);
  const [selectedMarket, setSelectedMarket] = useState(1);
  const [timeRange, setTimeRange] = useState(30); // 7 or 30 days

  const [forecast, setForecast] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [cropsRes, marketsRes] = await Promise.all([
        api.get("/crops"),
        api.get("/markets")
      ]);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);
      if (cropsRes.data.length > 0 && marketsRes.data.length > 0) {
        setSelectedCrop(cropsRes.data[0].id);
        setSelectedMarket(marketsRes.data[0].id);
        fetchForecast(cropsRes.data[0].id, marketsRes.data[0].id, 30);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecast = async (cId, mId, days) => {
    setLoading(true);
    try {
      const [fcRes, trRes] = await Promise.all([
        api.get(`/predictions/forecast?crop_id=${cId}&market_id=${mId}`),
        api.get(`/predictions/trends?crop_id=${cId}&market_id=${mId}&days=${days}`)
      ]);
      setForecast(fcRes.data);
      setTrendData(trRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (cId, mId, days) => {
    setSelectedCrop(cId);
    setSelectedMarket(mId);
    setTimeRange(days);
    fetchForecast(cId, mId, days);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mandi Price Trends & AI Prediction
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Interactive 7-day and 30-day moving price curves, AI predictive forecast corridor, and Sell Now vs. Wait momentum advisory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase mr-1">Time Horizon:</span>
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => handleUpdate(selectedCrop, selectedMarket, d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === d
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Filter Selection Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Vegetable
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => handleUpdate(Number(e.target.value), selectedMarket, timeRange)}
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
              Select APMC Mandi
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => handleUpdate(selectedCrop, Number(e.target.value), timeRange)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Grid: Chart + AI Prediction */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-600">Computing time-series trends and predictive models...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interactive Price Trend Chart (Recharts) */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {forecast?.crop_name} Price Trend ({timeRange} Days)
                  </h3>
                  <span className="text-xs text-slate-600">Mandi: {forecast?.market_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 uppercase font-bold block">Current Modal</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ₹{forecast?.current_modal_price.toLocaleString("en-IN")}/Q
                  </span>
                </div>
              </div>

              {/* Chart Visual */}
              <div className="h-72 sm:h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val) => [`₹${val}/Quintal`]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="max_price"
                      name="Max Price"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="modal_price"
                      name="Modal (Benchmark)"
                      stroke="#0f766e"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="min_price"
                      name="Min Price"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-3 flex justify-between">
                <span>Green: Maximum Auction Bid | Teal: Daily Modal | Amber: Minimum Gate Bid</span>
                <span>Unit: INR / Quintal</span>
              </div>
            </div>

            {/* AI Prediction & Sell Now vs Wait Advisory Card */}
            {forecast && (
              <div className="space-y-6">
                {/* Decision Box: SELL NOW or CONSIDER WAITING */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm ${
                    forecast.recommendation === "CONSIDER WAITING"
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Recommendation Verdict
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        forecast.recommendation === "CONSIDER WAITING"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      AI SIGNAL
                    </span>
                  </div>

                  <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {forecast.recommendation === "CONSIDER WAITING" ? (
                      <ArrowUpRight className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-8 h-8 text-amber-600" />
                    )}
                    <span>{forecast.recommendation}</span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    Momentum Signal: <strong className="uppercase font-extrabold">{forecast.trend_direction}</strong>.{" "}
                    Confidence: <strong>{forecast.confidence_percentage}%</strong>
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Why this signal?</span>
                    {forecast.decision_reasons.map((r, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Price Corridor Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                      7-Day Forecast Corridor
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      AI ESTIMATE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase font-semibold block">Lower Bound</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        ₹{forecast.predicted_min_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">Predicted Modal</span>
                      <span className="text-base font-black text-emerald-800 font-mono">
                        ₹{forecast.predicted_modal_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase font-semibold block">Upper Bound</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        ₹{forecast.predicted_max_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3 italic">
                    {forecast.disclaimer}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
