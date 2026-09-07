import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  Users,
  Layers,
  TrendingUp,
  Truck,
  PlusCircle,
  Building2,
  CheckCircle2,
  BarChart2,
  Scale
} from "lucide-react";

export default function FPODashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFPOData();
  }, []);

  const fetchFPOData = async () => {
    setLoading(true);
    try {
      const [fpoRes, anaRes] = await Promise.all([
        api.get("/fpo/aggregated-crops"),
        api.get("/fpo/analytics")
      ]);
      setData(fpoRes.data);
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* FPO Hero Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                FPO Collective Command
              </span>
              <span className="text-xs text-purple-200">
                Federation: {data?.fpo_name || user?.full_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {data?.fpo_name || "Sahyadri Agro Producers Co."}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-purple-100 max-w-xl">
              Coordinating <strong>{data?.member_count || 540} Member Farmers</strong> across Niphad, Dindori & Yeola blocks.
              Aggregating farm produce for institutional bulk contracting and collective freight savings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/compare-markets"
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>Bulk APMC Comparison</span>
            </Link>
            <Link
              to="/create-lot"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xs transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <span>Create Collective Lot</span>
            </Link>
          </div>
        </div>

        {/* FPO Analytics Metrics */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-xs font-bold uppercase">Member Tonnage</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics.total_member_volume_quintals} Q
              </div>
              <span className="text-[11px] text-slate-600">Total available lot volume</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-xs font-bold uppercase">Bulk Listings</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics.active_bulk_listings}
              </div>
              <span className="text-[11px] text-slate-600">Active collective contracts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-xs font-bold uppercase">Bulk Freight Savings</span>
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {analytics.estimated_bulk_freight_savings}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Logistics efficiency</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-xs font-bold uppercase">Group Turnover</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900 font-mono">
                ₹{analytics.total_group_turnover.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-slate-600">Completed trades</span>
            </div>
          </div>
        )}

        {/* Aggregated Member Crops Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Aggregated Member Produce Inventory
              </h3>
              <p className="text-xs text-slate-600">
                Consolidated volume pool ready for institutional buyers or bulk APMC auction dispatch.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-600">Aggregating member data...</p>
            </div>
          ) : !data || data.aggregated_crops.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-semibold text-slate-700">No member lots currently aggregated</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Commodity</th>
                    <th className="py-3.5 px-4 text-right">Pooled Volume</th>
                    <th className="py-3.5 px-4 text-right">Farmer Lots</th>
                    <th className="py-3.5 px-4 text-right">Average Asking</th>
                    <th className="py-3.5 px-4 text-right font-black text-purple-900">Total Pool Value</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {data.aggregated_crops.map((c) => (
                    <tr key={c.crop_id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.crop_name}{" "}
                        <span className="font-normal text-slate-600 text-[11px]">({c.hindi_name})</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {c.total_quantity_quintals} Quintals
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">{c.total_lots_count} Lots</td>
                      <td className="py-3.5 px-4 text-right font-mono">₹{c.average_expected_price.toLocaleString("en-IN")}/Q</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-purple-900">
                        ₹{c.aggregated_value.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/compare-markets`}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition"
                        >
                          Find Best Mandi &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

