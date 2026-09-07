import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { ShoppingBag, FileText, Truck, Bell, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/offers/buyer"), api.get("/transactions")])
      .then(([o, t]) => { setOffers(o.data); setTransactions(t.data); })
      .catch(console.error);
  }, []);

  const pending = offers.filter(o => ["Pending", "Countered"].includes(o.status)).length;
  const activeDeals = transactions.filter(t => !["Completed", "Cancelled"].includes(t.order_status)).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-400/20 text-blue-100 border border-blue-300/20 text-xs font-bold uppercase">Buyer Command Center</span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3">Welcome, {user?.full_name}!</h1>
            <p className="text-sm text-blue-100 mt-1">Find farmer lots, negotiate directly, and manage confirmed agricultural orders.</p>
          </div>
          <Link to="/marketplace" className="px-5 py-3 rounded-xl bg-white text-blue-800 font-bold text-sm inline-flex items-center gap-2">Browse Marketplace <ArrowRight className="w-4 h-4" /></Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon={<ShoppingBag />} label="Marketplace" value="Browse Lots" href="/marketplace" />
          <Stat icon={<FileText />} label="Pending / Countered Offers" value={pending} href="/offers" />
          <Stat icon={<Truck />} label="Active Deals" value={activeDeals} href="/transactions" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Action href="/marketplace" title="Search Farmer Crop Lots" text="Filter by crop, quantity, quality and district." icon={<ShoppingBag />} />
          <Action href="/offers" title="My Offers" text="Review bids, counter offers and accepted deals." icon={<FileText />} />
          <Action href="/transactions" title="Orders & Transactions" text="View pickup, delivery and fulfillment status." icon={<Truck />} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" /> Buyer workflow</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
            {["Find a crop lot", "Send / negotiate offer", "Confirm deal", "Track pickup → delivery"].map((x,i) => <div key={x} className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-blue-600 font-black mr-2">0{i+1}</span>{x}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({icon,label,value,href}) { return <Link to={href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 transition"><div className="text-blue-600 mb-2">{React.cloneElement(icon,{className:"w-5 h-5"})}</div><div className="text-xs text-slate-600">{label}</div><div className="text-xl font-black text-slate-900 mt-1">{value}</div></Link>; }
function Action({href,title,text,icon}) { return <Link to={href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-emerald-300 transition"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">{React.cloneElement(icon,{className:"w-5 h-5"})}</div><h3 className="font-bold text-slate-900">{title}</h3><p className="text-xs text-slate-600 mt-1">{text}</p></Link>; }
