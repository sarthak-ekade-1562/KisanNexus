import React, { useState, useEffect } from "react";
import api from "../api/client";
import {
  ShieldAlert,
  Database,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Building2,
  Users,
  TrendingUp,
  FileCheck
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  // Manual Price Entry form states
  const [manualCrop, setManualCrop] = useState(1);
  const [manualMarket, setManualMarket] = useState(1);
  const [manualModal, setManualModal] = useState(3000);
  const [manualMin, setManualMin] = useState(2600);
  const [manualMax, setManualMax] = useState(3300);
  const [manualSuccess, setManualSuccess] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, anomRes, cropsRes, marketsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/anomalies"),
        api.get("/crops"),
        api.get("/markets")
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setAnomalies(anomRes.data);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await api.post("/admin/sync-now");
      setSyncMsg(res.data.message);
      fetchAdminData();
    } catch (err) {
      setSyncMsg("Sync failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const toggleVerifyBuyer = async (buyerId, currentStatus) => {
    const nextStatus = currentStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
    try {
      await api.patch(`/admin/buyers/${buyerId}/verify`, { verification_status: nextStatus });
      fetchAdminData();
    } catch (err) {
      alert("Error toggling buyer verification: " + (err.response?.data?.detail || err.message));
    }
  };

  const clearAnomaly = async (lotId) => {
    try {
      await api.patch(`/admin/anomalies/${lotId}/clear`);
      setAnomalies((prev) => prev.filter((a) => a.id !== lotId));
    } catch (err) {
      alert("Error clearing anomaly: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleManualPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/market-prices/manual", {
        crop_id: Number(manualCrop),
        market_id: Number(manualMarket),
        modal_price: Number(manualModal),
        min_price: Number(manualMin),
        max_price: Number(manualMax)
      });
      setManualSuccess(true);
      setTimeout(() => setManualSuccess(false), 2000);
      fetchAdminData();
    } catch (err) {
      alert("Error adding manual price: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                Restricted System Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              KisanNexus Administrative Desk
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              APMC Mandi Data Synchronization, Anomaly Detection & Trader Verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Synchronizing API..." : "Sync Market Data Now"}</span>
            </button>
          </div>
        </div>

        {syncMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMsg}</span>
          </div>
        )}

        {/* System Overview Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Registered Farmers</span>
              <span className="text-2xl font-black text-slate-900">{stats.total_farmers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Traders & Buyers</span>
              <span className="text-2xl font-black text-slate-900">{stats.total_buyers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">FPO Groups</span>
              <span className="text-2xl font-black text-slate-900">{stats.total_fpos}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Active Listings</span>
              <span className="text-2xl font-black text-emerald-700">{stats.active_listings}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Completed Trades</span>
              <span className="text-2xl font-black text-slate-900">{stats.completed_transactions}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Flagged Anomalies</span>
              <span className="text-2xl font-black text-amber-600">{stats.flagged_suspicious_listings}</span>
            </div>
          </div>
        )}

        {/* Market Price API Architecture Monitor (Requirement 7) */}
        {stats?.api_status && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Market Price API Integration Status
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  stats.api_status.data_status_mode === "LIVE / VERIFIED DATA"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                MODE: {stats.api_status.data_status_mode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 block">API Connection</span>
                <span className="font-extrabold text-slate-900">
                  {stats.api_status.api_connected ? "🟢 CONNECTED" : "🟡 DISCONNECTED (Demo Fallback)"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 block">Data Source</span>
                <span className="font-extrabold text-slate-900">{stats.api_status.data_source}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 block">Last Sync Timestamp</span>
                <span className="font-extrabold text-slate-900">
                  {new Date(stats.api_status.last_sync_time).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 block">Active Price Records</span>
                <span className="font-extrabold text-slate-900">{stats.api_status.total_records} Records</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              * The system is production-ready for data.gov.in / AGMARKNET API integration via environment variables (<code>MARKET_API_URL</code> & <code>MARKET_API_KEY</code>). If credentials are absent or external services time out, the platform automatically maintains uninterrupted operations using calibrated baseline demo data.
            </p>
          </div>
        )}

        {/* Suspicious Listing Detection (Requirement 28) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Suspicious Price Anomaly Detection</h3>
              <p className="text-xs text-slate-600">
                Listings automatically flagged due to significant price deviation (&gt;35-40%) compared with recent APMC modal data.
              </p>
            </div>
          </div>

          {anomalies.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No abnormal listing prices currently detected. All active lots match historical ranges.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {a.quantity_quintals} Q of {a.crop_name} by {a.farmer_name}
                    </span>
                    <div className="text-amber-900 font-medium mt-1">
                      {a.suspicious_reason || "Price appears unusual compared with recent market data."}
                    </div>
                  </div>
                  <button
                    onClick={() => clearAnomaly(a.id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold transition shrink-0"
                  >
                    Clear Flag (Verified)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trader Verification Management (Requirement 21) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Buyer & Trader Verification Management</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Entity / Buyer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Business Details</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Toggle Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {usersList
                  .filter((u) => u.role === "Buyer")
                  .map((b) => {
                    const status = b.buyer_profile?.verification_status || "UNVERIFIED";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {b.buyer_profile?.company_name || b.full_name}
                          <span className="block text-[10px] text-slate-600 font-normal">{b.email}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{b.phone || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-600">
                          GST: {b.buyer_profile?.gst_number || "Pending"} • Orders: {b.buyer_profile?.completed_orders || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              status === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {status === "VERIFIED" ? "VERIFIED BUYER" : "UNVERIFIED BUYER"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleVerifyBuyer(b.id, status)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                              status === "VERIFIED"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {status === "VERIFIED" ? "Revoke Verification" : "Verify Trader"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Verified Price Correction (Requirement 27) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Manual Verified Market Price Entry</h3>
              <p className="text-xs text-slate-600">
                Authorized administrators can manually record or correct verified APMC quotes. Entries are badged as "ADMIN VERIFIED".
              </p>
            </div>
          </div>

          {manualSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified market price record added successfully with 'ADMIN VERIFIED' tag!
            </div>
          )}

          <form onSubmit={handleManualPriceSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Crop</label>
              <select
                value={manualCrop}
                onChange={(e) => setManualCrop(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">APMC Mandi</label>
              <select
                value={manualMarket}
                onChange={(e) => setManualMarket(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Min Rate (₹)</label>
              <input
                type="number"
                required
                value={manualMin}
                onChange={(e) => setManualMin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Modal Benchmark (₹)</label>
              <input
                type="number"
                required
                value={manualModal}
                onChange={(e) => setManualModal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Rate</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
