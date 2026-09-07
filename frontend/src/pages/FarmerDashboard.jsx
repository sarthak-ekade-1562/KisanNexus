import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  Sprout,
  Compass,
  Scale,
  TrendingUp,
  ShoppingBag,
  Bell,
  CloudSun,
  PlusCircle,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [myLots, setMyLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [topPrices, setTopPrices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [lotsRes, offersRes, alertsRes, pricesRes, weatherRes] = await Promise.all([
        api.get("/lots/my-lots"),
        api.get("/offers/farmer"),
        api.get("/price-alerts"),
        api.get("/market-prices?limit=4"),
        api.get(`/weather?location=${encodeURIComponent(user?.district || "Nashik")}`)
      ]);
      setMyLots(lotsRes.data);
      setOffers(offersRes.data);
      setAlerts(alertsRes.data);
      setTopPrices(pricesRes.data);
      setWeather(weatherRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingOffers = offers.filter((o) => o.status === "Pending" || o.status === "Countered");

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Farmer Profile Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Farmer Command Center
              </span>
              <span className="text-xs text-emerald-200">
                {user?.location || "Nashik Hub"}, {user?.district}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Namaste, {user?.full_name}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-xl">
              Farm Area: <strong>{user?.farmer_profile?.farm_size_acres || 5} Acres</strong> • Primary Crops:{" "}
              <strong>{user?.farmer_profile?.primary_crops || "Onion, Tomato"}</strong> • Irrigation:{" "}
              <strong>{user?.farmer_profile?.irrigation_type || "Drip"}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/where-to-sell"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Where to Sell?</span>
            </Link>
            <Link
              to="/create-lot"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xs transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Create Crop Lot</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-bold uppercase">My Active Lots</span>
              <Sprout className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{myLots.length}</div>
            <span className="text-[11px] text-slate-600">Digital crop listings</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-bold uppercase">Buyer Offers</span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{pendingOffers.length}</div>
            <span className="text-[11px] text-blue-600 font-semibold">Active negotiations</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-bold uppercase">Price Alerts</span>
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{alerts.length}</div>
            <span className="text-[11px] text-slate-600">Active mandi thresholds</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-bold uppercase">Mandi Realization</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">₹3,050/Q</div>
            <span className="text-[11px] text-slate-600">Avg Nashik Onion Modal</span>
          </div>
        </div>

        {/* Two-Column Layout: Active Lots/Offers & Weather/Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: My Lots & Incoming Offers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incoming Offers Alert Box */}
            {pendingOffers.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <h3 className="text-base font-bold text-amber-900">
                      Pending Buyer Offers ({pendingOffers.length})
                    </h3>
                  </div>
                  <Link to="/offers" className="text-xs font-bold text-amber-800 hover:underline">
                    View All &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {pendingOffers.map((off) => (
                    <div
                      key={off.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{off.buyer_company}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {off.buyer_verification}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Offer for <strong>{off.quantity} Quintals</strong> of <strong>{off.crop_name}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900 font-mono">
                            ₹{off.offered_price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-600 block">/ Quintal</span>
                        </div>
                        <Link
                          to="/offers"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Negotiate &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Active Digital Crop Lots */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">My Digital Crop Lots</h3>
                  <p className="text-xs text-slate-600">Listings visible to verified traders on KisanNexus</p>
                </div>
                <Link
                  to="/create-lot"
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Lot</span>
                </Link>
              </div>

              {myLots.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <Sprout className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No crop lots listed yet</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Create your first digital lot to receive buyer bids</p>
                  <Link
                    to="/create-lot"
                    className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Create Lot Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{lot.crop_name}</h4>
                          <span className="text-xs text-slate-600 font-medium">({lot.variety})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {lot.quality_grade}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                          <span>Volume: <strong>{lot.quantity_quintals} Quintals</strong></span>
                          <span>Location: {lot.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-base font-black text-slate-900 font-mono">
                            ₹{lot.expected_price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-600 block">Asking / Quintal</span>
                        </div>
                        <Link
                          to={`/marketplace?crop_id=${lot.crop_id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                        >
                          Find Buyers
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weather Intelligence & Mandi Ticker */}
          <div className="space-y-6">
            {/* Weather Intelligence Card (Requirement 29) */}
            {weather && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Agro Weather Intelligence</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {weather.data_status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100">
                  <div>
                    <div className="text-3xl font-black text-slate-900 font-mono">
                      {weather.temperature}°C
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{weather.weather_condition}</span>
                  </div>
                  <div className="text-right text-xs text-slate-600 space-y-0.5">
                    <div>Location: <strong>{weather.location}</strong></div>
                    <div>Humidity: <strong>{weather.humidity}%</strong></div>
                    <div>Wind: <strong>{weather.wind_speed_kmh} km/h</strong></div>
                  </div>
                </div>

                {/* Harvesting & Transit Advisories */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Transit & Harvest Advisory
                  </span>
                  {weather.advisories.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Benchmark Mandi Rates */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Mandi Benchmarks</h3>
                <Link to="/market-prices" className="text-xs font-bold text-emerald-600 hover:underline">
                  All &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {topPrices.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{p.crop_name}</span>
                      <span className="text-[10px] text-slate-600">{p.market_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-mono text-slate-900">
                        ₹{p.modal_price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-600 block">/ Quintal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
