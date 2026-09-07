import React, { useState, useEffect } from "react";
import api from "../api/client";
import { Bell, PlusCircle, Trash2, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [cropId, setCropId] = useState(1);
  const [marketId, setMarketId] = useState("");
  const [targetPrice, setTargetPrice] = useState(3000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, cropsRes, marketsRes] = await Promise.all([
        api.get("/price-alerts"),
        api.get("/crops"),
        api.get("/markets")
      ]);
      setAlerts(alertsRes.data);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/price-alerts", {
        crop_id: Number(cropId),
        market_id: marketId ? Number(marketId) : null,
        target_price: Number(targetPrice),
        condition: "GREATER_EQUAL"
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/price-alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Mandi Price Alerts & Notifications
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Set target price thresholds for your crops. We'll automatically notify you the moment APMC auctions cross your target.
            </p>
          </div>
        </div>

        {/* Set New Alert Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            Create New Price Threshold Alert
          </h3>
          <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Crop</label>
              <select
                value={cropId}
                onChange={(e) => setCropId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Mandi (Optional)</label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Any Mandi in Region</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Target Price (₹/Quintal)</label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? "Setting..." : "Set Price Alert"}</span>
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Active Mandi Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">No price alerts configured.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {alerts.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{a.crop_name}</span>
                    <span className="text-slate-600 ml-2">({a.market_name || "Any Mandi"})</span>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      Trigger when modal rate &ge; ₹{a.target_price.toLocaleString("en-IN")}/Quintal
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
