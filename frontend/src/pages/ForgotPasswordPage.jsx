import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Sprout, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message);
      if (res.data.reset_token) {
        setTokenInfo(res.data.reset_token);
      }
    } catch (err) {
      setMsg("Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Reset Your Password</h2>
          <p className="mt-1 text-xs text-slate-600">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          {msg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{msg}</span>
              </div>
              {tokenInfo && (
                <div className="p-2 bg-white rounded-lg border border-emerald-300 font-mono text-center text-xs">
                  Demo Reset Token: <strong className="text-emerald-700">{tokenInfo}</strong>
                </div>
              )}
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
                  placeholder="farmer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
            >
              {loading ? "Generating Token..." : "Send Reset Token"}
            </button>
          </form>

          {tokenInfo && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(tokenInfo)}`}
                className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                Proceed to Reset Password Form &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-slate-600">
          Remember your password?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
