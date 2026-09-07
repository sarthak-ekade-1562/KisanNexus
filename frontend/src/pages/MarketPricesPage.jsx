import React, { useState, useEffect } from "react";
import api from "../api/client";
import {
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
  LayoutGrid,
  ListFilter,
  CheckCircle,
  Database,
  ArrowUpDown,
  TrendingUp,
  Info
} from "lucide-react";

export default function MarketPricesPage() {
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [priceMax, setPriceMax] = useState(10000);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedMarket, selectedDistrict, priceMax]);

  const fetchMetadata = async () => {
    try {
      const [cropsRes, marketsRes, statusRes] = await Promise.all([
        api.get("/crops"),
        api.get("/markets"),
        api.get("/market-prices/status")
      ]);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);
      setStatusInfo(statusRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      let url = `/market-prices?limit=200&max_price=${priceMax}`;
      if (selectedCrop) url += `&crop_id=${selectedCrop}`;
      if (selectedMarket) url += `&market_id=${selectedMarket}`;
      if (selectedDistrict) url += `&district=${selectedDistrict}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      setPrices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrices();
  };

  const filteredPrices = prices.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.crop_name.toLowerCase().includes(term) ||
      (p.hindi_name && p.hindi_name.toLowerCase().includes(term)) ||
      p.market_name.toLowerCase().includes(term) ||
      p.district.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Dual-Mode Transparency Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Live Vegetable Market Prices
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  statusInfo?.data_status_mode === "LIVE / VERIFIED DATA"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {statusInfo?.data_status_mode || "DEMO DATA"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Reported modal, minimum, and maximum rates across APMC mandis in Maharashtra (INR per Quintal)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPrices()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Rates
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "cards" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600"
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "table" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600"
                }`}
                title="Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vegetable (Onion, Tomato, Okra...) or mandi (Lasalgaon, Nashik, Pune...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Filter Vegetable
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All 16 Vegetables</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.hindi_name || ""})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Filter APMC Mandi
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Markets</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Districts</option>
                <option value="Nashik">Nashik</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Ahmednagar">Ahmednagar</option>
                <option value="Nagpur">Nagpur</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-slate-700 uppercase">
                <span>Max Price Range</span>
                <span className="text-emerald-700">₹{priceMax.toLocaleString("en-IN")}/Q</span>
              </div>
              <input
                type="range"
                min="1000"
                max="12000"
                step="500"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-600">Retrieving APMC vegetable price records...</p>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Info className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No market prices found</h3>
            <p className="text-xs text-slate-600 mt-1">Try resetting your search query or price range filter.</p>
          </div>
        ) : viewMode === "cards" ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPrices.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {p.crop_name}
                      </h3>
                      <span className="text-xs text-slate-600 font-medium">{p.hindi_name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        p.data_status === "LIVE / VERIFIED DATA"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.data_status === "ADMIN VERIFIED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.data_status}
                    </span>
                  </div>

                  <div className="mt-4 mb-2">
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{p.modal_price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-600 ml-1">/ Quintal</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-600 text-[10px] block uppercase">Min Price</span>
                        <span className="font-bold text-slate-700">₹{p.min_price.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 text-[10px] block uppercase">Max Price</span>
                        <span className="font-bold text-slate-700">₹{p.max_price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{p.market_name}</span>
                    </span>
                    <span className="text-[11px] text-slate-600 shrink-0 font-medium">{p.district}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Daily Arrivals: <strong>{p.arrivals_tonnes} Tonnes</strong></span>
                    <span>Date: {p.price_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Vegetable</th>
                    <th className="py-3.5 px-4">APMC Mandi</th>
                    <th className="py-3.5 px-4">District / State</th>
                    <th className="py-3.5 px-4 text-right">Min Rate</th>
                    <th className="py-3.5 px-4 text-right">Max Rate</th>
                    <th className="py-3.5 px-4 text-right font-black text-emerald-800">Modal Rate</th>
                    <th className="py-3.5 px-4 text-right">Arrivals</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredPrices.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.crop_name}{" "}
                        <span className="font-normal text-slate-600 text-[11px]">({p.hindi_name})</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.market_name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.district}, {p.state}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{p.min_price}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{p.max_price}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{p.modal_price}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{p.arrivals_tonnes} T</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {p.data_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
