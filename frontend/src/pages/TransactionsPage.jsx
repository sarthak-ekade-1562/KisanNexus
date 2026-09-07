import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  FileText,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Package,
  Layers
} from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setTxns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (txnId, newOrderStatus, newPaymentStatus) => {
    try {
      await api.patch(`/transactions/${txnId}/status`, {
        order_status: newOrderStatus,
        payment_status: newPaymentStatus
      });
      fetchTransactions();
    } catch (err) {
      alert("Status update failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Transaction Orders & Escrow Fulfillment
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Complete trade lifecycle: Confirmed &rarr; In-Transit &rarr; Delivered &rarr; Payment Released.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-600">Loading order history...</p>
          </div>
        ) : txns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No transactions recorded yet</h3>
            <p className="text-xs text-slate-600 mt-1">
              Once an offer is accepted by both parties, an official trade order is generated here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {txns.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
              >
                {/* Header: Tracking No & Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {t.tracking_number}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      {t.quantity} Q of {t.crop_name} Trade Order
                    </h3>
                    <p className="text-xs text-slate-600">
                      Farmer: <strong>{t.farmer_name}</strong> • Buyer: <strong>{t.buyer_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Order: {t.order_status}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      {t.payment_status}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline Stepper */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {["Confirmed", "In_Transit", "Delivered", "Completed"].map((step, idx) => {
                    const isDone =
                      (step === "Confirmed" && ["Confirmed", "In_Transit", "Delivered", "Completed"].includes(t.order_status)) ||
                      (step === "In_Transit" && ["In_Transit", "Delivered", "Completed"].includes(t.order_status)) ||
                      (step === "Delivered" && ["Delivered", "Completed"].includes(t.order_status)) ||
                      (step === "Completed" && t.order_status === "Completed");

                    return (
                      <div key={step} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            isDone ? "bg-emerald-600" : "bg-slate-200"
                          }`}
                        ></div>
                        <span className={`text-[10px] font-bold ${isDone ? "text-slate-900" : "text-slate-600"}`}>
                          {step.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Ledger Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-600 text-[11px] block">Agreed Rate</span>
                    <span className="font-extrabold text-slate-900 text-sm font-mono">
                      ₹{t.agreed_price.toLocaleString("en-IN")}/Q
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 text-[11px] block">Gross Invoice Value</span>
                    <span className="font-extrabold text-slate-900 text-sm font-mono">
                      ₹{t.gross_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 text-[11px] block">Transport & Handling</span>
                    <span className="font-extrabold text-red-600 text-sm font-mono">
                      -₹{t.transport_cost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 text-[11px] font-bold block">Net Farmer Payout</span>
                    <span className="font-black text-emerald-800 text-base font-mono">
                      ₹{t.net_farmer_payout.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="text-[10px] uppercase font-bold text-emerald-700">Pickup Location</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{t.pickup_location || "To be scheduled"}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Visible only to the farmer and buyer after deal confirmation.</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="text-[10px] uppercase font-bold text-blue-700">Delivery Location</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{t.delivery_location || "To be scheduled"}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Private trade information for the confirmed order.</div>
                  </div>
                </div>

                {/* Status Update Trigger Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600">
                    Created on: {new Date(t.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    {t.order_status === "Confirmed" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "In_Transit", t.payment_status)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch & Set In-Transit</span>
                      </button>
                    )}

                    {t.order_status === "In_Transit" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "Delivered", "Escrow_Held")}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery at Yard</span>
                      </button>
                    )}

                    {t.order_status === "Delivered" && t.payment_status !== "Completed" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "Completed", "Released")}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Release Escrow to Farmer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
