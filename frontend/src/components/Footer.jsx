import React from "react";
import { Link } from "react-router-dom";
import { Sprout, Shield, Database, Cpu, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & SIH */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                KISAN<span className="text-emerald-500">NEXUS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart India Hackathon (SIH) Problem Statement 26132:
              <br />
              <strong className="text-slate-300">
                "Strengthening Market Linkages and Price Discovery for Farmers"
              </strong>
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Mandi Gateway & Dual-Mode Fallback
            </div>
          </div>

          {/* Col 2: The Three Questions */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Farmer Core Questions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/where-to-sell" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span className="text-emerald-500">1.</span> WHERE should I sell? (Net Return APMC)
                </Link>
              </li>
              <li>
                <Link to="/price-trends" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span className="text-emerald-500">2.</span> WHEN should I sell? (AI Trends & Wait)
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span className="text-emerald-500">3.</span> TO WHOM should I sell? (Direct Buyers)
                </Link>
              </li>
              <li>
                <Link to="/compare-markets" className="hover:text-emerald-400 transition">
                  Transport Freight & Profit Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Verified Market Intelligence */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Market Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/market-prices" className="hover:text-emerald-400 transition">
                  Live Vegetable Mandi Prices
                </Link>
              </li>
              <li>
                <Link to="/requirements" className="hover:text-emerald-400 transition">
                  Reverse Procurement Marketplace
                </Link>
              </li>
              <li>
                <Link to="/fpo-dashboard" className="hover:text-emerald-400 transition">
                  FPO Collective Aggregation
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard" className="hover:text-emerald-400 transition">
                  Admin Sync & Data Integrity
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Transparency & Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              KisanNexus strictly distinguishes between official live feeds and calibrated demo records.
              All digital transactions are protected via milestone-verified escrow workflows.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verified APMC Mandi Data Architecture</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 KisanNexus. Developed for Smart India Hackathon.</p>
          <p className="mt-2 sm:mt-0 text-[11px]">
            AI recommendations are advisory estimates. Always verify local APMC auction conditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
