import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Sprout, AlertTriangle, CheckCircle2, ArrowRight, MapPin, Calendar, Layers, Camera, X } from "lucide-react";

export default function CreateLotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState(1);
  const [quantity, setQuantity] = useState(50);
  const [grade, setGrade] = useState("Grade A");
  const [variety, setVariety] = useState("Nashik Red Garwa");
  const [expectedPrice, setExpectedPrice] = useState(3000);
  const [location, setLocation] = useState(user?.location || "Pimpalgaon Baswant");
  const [district, setDistrict] = useState(user?.district || "Nashik");
  const [state, setState] = useState("Maharashtra");
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");

  const [anomalyWarning, setAnomalyWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await api.get("/crops");
      setCrops(res.data);
      if (res.data.length > 0) {
        setCropId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check price reasonableness on the fly
  useEffect(() => {
    if (expectedPrice > 6000 && cropId === 1) {
      setAnomalyWarning("Note: Asking price (₹" + expectedPrice + "/Q) appears significantly higher than recent Onion APMC modal rates (~₹3,000/Q). The listing will be flagged for routine admin inspection.");
    } else if (expectedPrice < 800 && expectedPrice > 0) {
      setAnomalyWarning("Note: Asking price appears unusually low compared with market averages.");
    } else {
      setAnomalyWarning(null);
    }
  }, [expectedPrice, cropId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/lots", {
        crop_id: Number(cropId),
        quantity_quintals: Number(quantity),
        quality_grade: grade,
        variety,
        expected_price: Number(expectedPrice),
        location,
        district,
        state,
        image_urls: images
      });

      navigate("/farmer-dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create crop lot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Digital Crop Lot
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            List your harvest lot to attract verified institutional buyers and traders
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {anomalyWarning && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{anomalyWarning}</span>
            </div>
          )}

          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-600" /> Crop Photos</label>
              <span className="text-[11px] text-slate-500">Up to 5 • JPG/PNG/WebP</span>
            </div>
            <input id="crop-images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={async (e) => {
              setImageError("");
              const files = Array.from(e.target.files || []);
              if (files.length > 5 || images.length + files.length > 5) { setImageError("You can upload a maximum of 5 photos."); return; }
              const valid = files.filter(f => f.size <= 1200 * 1024);
              if (valid.length !== files.length) { setImageError("Each image must be 1.2 MB or smaller."); return; }
              const read = (file) => new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
              try {
                const dataUrls = await Promise.all(valid.map(read));
                setImages(prev => [...prev, ...dataUrls]);
              } catch {
                setImageError("Could not read one of the selected images.");
              }
              e.target.value = "";
            }} />
            <label htmlFor="crop-images" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-50">
              <Camera className="w-4 h-4" /> Add crop photos
            </label>
            {imageError && <p className="text-xs text-red-600 font-semibold mt-2">{imageError}</p>}
            {images.length > 0 && <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">{images.map((src,i)=><div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200"><img src={src} alt={`Crop ${i+1}`} className="w-full h-full object-cover"/><button type="button" onClick={()=>setImages(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"><X className="w-3.5 h-3.5"/></button></div>)}</div>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Vegetable Crop
                </label>
                <select
                  value={cropId}
                  onChange={(e) => setCropId(Number(e.target.value))}
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
                  Variety / Seed
                </label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Nashik Red Garwa, Abhinav"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity (Quintals)
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
                  Quality Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Commercial)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Asking Price (₹ / Quintal)
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Farm Yard / Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  District
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Lot Gross Estimate: <strong className="text-slate-900 font-mono">₹{(quantity * expectedPrice).toLocaleString("en-IN")}</strong>
              </span>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                <span>{loading ? "Creating Lot..." : "Publish Digital Lot"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
