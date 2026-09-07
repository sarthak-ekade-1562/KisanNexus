import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route to role dashboard
      if (user.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "Buyer") {
        navigate("/buyer-dashboard");
      } else if (user.role === "FPO") {
        navigate("/fpo-dashboard");
      } else {
        navigate("/farmer-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (uEmail, uPass) => {
    setEmail(uEmail);
    setPassword(uPass);
    setError("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In to KisanNexus</h2>
          <p className="mt-2 text-xs text-slate-600">
            Access your agricultural market intelligence and smart trading hub
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* One-Click Quick Fill Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2 text-center">
              Quick One-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill("farmer@kisannexus.in", "Farmer@123")}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 text-left transition"
              >
                🌾 Farmer Patil
                <span className="block text-[10px] text-emerald-600 font-normal">Nashik Hub</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill("buyer@kisannexus.in", "Buyer@123")}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 text-left transition"
              >
                🏢 Verified Buyer
                <span className="block text-[10px] text-blue-600 font-normal">AgriTrade Pvt Ltd</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill("fpo@kisannexus.in", "FPO@123")}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 text-left transition"
              >
                🚜 FPO Federation
                <span className="block text-[10px] text-purple-600 font-normal">540 Farmers</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill("admin@kisannexus.in", "Admin@123")}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 text-left transition"
              >
                🛡️ System Admin
                <span className="block text-[10px] text-amber-600 font-normal">Sync & Verification</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600">
          New to KisanNexus?{" "}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register your farmer or trader account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
