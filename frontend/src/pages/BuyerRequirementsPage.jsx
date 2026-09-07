import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Building2, PlusCircle, CheckCircle2, ShieldCheck, MapPin, Calendar, Layers } from "lucide-react";

export default function BuyerRequirementsPage() {
  const { user } = useAuth();
  const [reqs, setReqs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Requirement Modal state
  const [showModal, setShowModal] = useState(false);
  const [cropId, setCropId] = useState(1);
  const [quantity, setQuantity] = useState(100);
  const [grade, setGrade] = useState("Grade A");
  const [budgetPrice, setBudgetPrice] = useState(3100);
  const [region, setRegion] = useState("Nashik Region");
  const [district, setDistrict] = useState("Nashik");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqsRes, cropsRes] = await Promise.all([
        api.get("/buyers/requirements"),
        api.get("/crops")
      ]);
      setReqs(reqsRes.data);
      setCrops(cropsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/buyers/requirements", {
        crop_id: Number(cropId),
        required_quantity: Number(quantity),
        quality_grade: grade,
        region,
        district,
        budget_price: Number(budgetPrice),
        notes
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Reverse Procurement Marketplace
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Verified institutional buyers post bulk supply demands with fixed procurement budgets. Farmers & FPOs can fulfill directly.
            </p>
          </div>

          {user?.role === "Buyer" && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Procurement Demand</span>
            </button>
          )}
        </div>

        {/* Requirements Grid */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-600">Loading procurement demands...</p>
          </div>
        ) : reqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-700">No open buyer requirements listed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reqs.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{r.crop_name} Needed</h3>
                      <span className="text-xs text-slate-600">{r.company_name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {r.verification_status}
                    </span>
                  </div>

                  <div className="my-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Quantity Needed:</span>
                      <span className="font-extrabold text-slate-900">{r.required_quantity} Quintals</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Quality Spec:</span>
                      <span className="font-bold text-blue-800">{r.quality_grade}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-200/80 pt-2">
                      <span className="text-slate-600">Procurement Budget:</span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        ₹{r.budget_price.toLocaleString("en-IN")}/Q
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                    "{r.notes || 'Immediate fulfillment requested at farm gate or regional warehouse.'}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {r.region}
                  </span>
                  <span className="text-[10px] text-slate-600">Target Date: {r.delivery_date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Procurement Demand Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Post Procurement Requirement</h3>
              <form onSubmit={handleCreateRequirement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Crop Needed</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Quantity (Quintals)</label>
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Budget (₹/Q)</label>
                    <input
                      type="number"
                      required
                      value={budgetPrice}
                      onChange={(e) => setBudgetPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Grade Spec</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Grade C">Grade C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Procurement Region</label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Procurement Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Bulk procurement for retail supply. Immediate payment upon inspection."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    {submitting ? "Posting..." : "Publish Demand"}
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
