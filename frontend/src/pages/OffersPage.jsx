import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  AlertCircle
} from "lucide-react";

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Counter Modal
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === "Buyer" ? "/offers/buyer" : "/offers/farmer";
      const res = await api.get(endpoint);
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId) => {
    if (!window.confirm("Accept this offer and generate an official purchase transaction with Escrow protection?")) return;
    setActionLoading(true);
    try {
      await api.post(`/offers/${offerId}/accept`);
      fetchOffers();
    } catch (err) {
      alert("Error accepting offer: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (offerId) => {
    if (!window.confirm("Decline this purchase offer?")) return;
    setActionLoading(true);
    try {
      await api.post(`/offers/${offerId}/reject`);
      fetchOffers();
    } catch (err) {
      alert("Error declining offer: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const submitCounter = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/offers/${activeOffer.id}/counter`, {
        counter_price: Number(counterPrice),
        message: counterMsg
      });
      setCounterModalOpen(false);
      fetchOffers();
    } catch (err) {
      alert("Error submitting counter offer: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trade Offers & Negotiations
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Manage purchase bids, negotiate price counter-offers, and confirm digital sales contracts.
            </p>
          </div>
          <Link
            to="/transactions"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>View Orders & Escrow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-600">Loading offer negotiations...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No active offers yet</h3>
            <p className="text-xs text-slate-600 mt-1">
              Offers from buyers or counter-proposals will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-slate-900">{o.crop_name} Lot</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          o.status === "Accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : o.status === "Countered"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                      <span>Buyer: <strong>{o.buyer_company}</strong> ({o.buyer_name})</span>
                      <span>•</span>
                      <span>Farmer: <strong>{o.farmer_name}</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{o.offered_price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-600 block">/ Quintal ({o.quantity} Q total)</span>
                  </div>
                </div>

                {/* Offer Notes & Target Date */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800">Terms / Notes:</span>{" "}
                    {o.notes || "Standard farm gate pickup terms with escrow payment."}
                  </div>
                  <div className="text-slate-600 shrink-0">
                    Pickup Target: <strong>{o.delivery_date}</strong>
                  </div>
                </div>

                {/* Negotiation Timeline (Requirement 20) */}
                {o.negotiations && o.negotiations.length > 0 && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-900 text-[10px] block">
                      Negotiation History ({o.negotiations.length} Rounds)
                    </span>
                    {o.negotiations.map((n) => (
                      <div key={n.id} className="flex items-center justify-between py-1 border-b border-emerald-100 last:border-0">
                        <span className="font-semibold text-slate-800">
                          {n.sender_role}: Countered to <strong>₹{n.counter_price.toLocaleString("en-IN")}/Q</strong>
                          {n.message && <span className="font-normal italic text-slate-600 ml-2">"{n.message}"</span>}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions Bar */}
                {o.status !== "Accepted" && o.status !== "Rejected" && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600 font-medium">
                      Estimated Deal Gross: <strong className="text-slate-900">₹{(o.offered_price * o.quantity).toLocaleString("en-IN")}</strong>
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveOffer(o);
                          setCounterPrice(o.offered_price);
                          setCounterModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition"
                      >
                        Counter Offer
                      </button>

                      <button
                        onClick={() => handleReject(o.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleAccept(o.id)}
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Accept & Lock Deal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Counter Offer Modal */}
        {counterModalOpen && activeOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Submit Counter Proposal</h3>
              <p className="text-xs text-slate-600">
                Current bid: ₹{activeOffer.offered_price}/Q for {activeOffer.quantity} Q {activeOffer.crop_name}
              </p>

              <form onSubmit={submitCounter} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Your Counter Price (₹ per Quintal)
                  </label>
                  <input
                    type="number"
                    required
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Negotiation Message
                  </label>
                  <textarea
                    rows={2}
                    value={counterMsg}
                    onChange={(e) => setCounterMsg(e.target.value)}
                    placeholder="e.g. Willing to close at ₹3,050 for prompt loading."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCounterModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    {actionLoading ? "Submitting..." : "Send Counter Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
