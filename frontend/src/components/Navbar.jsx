import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  Sprout,
  TrendingUp,
  BarChart3,
  Scale,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      // quiet fail
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                KISAN<span className="text-emerald-600">NEXUS</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                Smart Mandi Linkages
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/market-prices"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/market-prices")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Mandi Prices
            </Link>
            <Link
              to="/compare-markets"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/compare-markets")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Compare Markets
            </Link>
            <Link
              to="/where-to-sell"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/where-to-sell")
                  ? "bg-emerald-600 text-white font-semibold shadow-xs"
                  : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              }`}
            >
              Where to Sell?
            </Link>
            <Link
              to="/price-trends"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/price-trends")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Price Trends
            </Link>
            {user?.role === "Buyer" && (
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/marketplace")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Buyer Marketplace
            </Link>
            )}

            {/* Role-specific link */}
            {user?.role === "Farmer" && (
              <Link
                to="/farmer-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/farmer-dashboard")
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Farmer Hub
              </Link>
            )}

            {user?.role === "Buyer" && (
              <Link
                to="/buyer-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/buyer-dashboard")
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Buyer Hub
              </Link>
            )}

            {user?.role === "FPO" && (
              <Link
                to="/fpo-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/fpo-dashboard")
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                FPO Hub
              </Link>
            )}

            {user?.role === "Admin" && (
              <Link
                to="/admin-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin-dashboard")
                    ? "bg-amber-500 text-white font-semibold"
                    : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                Admin Desk
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-600 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`py-2.5 px-2 rounded-lg text-xs ${
                                !n.is_read ? "bg-emerald-50/70 font-medium" : "text-slate-600"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-slate-800">{n.title}</span>
                                <span className="text-[10px] text-slate-600">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={() => setNotificationsOpen(false)}
                                  className="text-emerald-600 hover:underline mt-1 inline-block font-semibold"
                                >
                                  View Details &rarr;
                                </Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Capsule */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                      {user.role} {user.buyer_profile?.verification_status === "VERIFIED" && "✓"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated && unreadCount > 0 && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <Link
            to="/market-prices"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mandi Prices
          </Link>
          <Link
            to="/compare-markets"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Compare Markets
          </Link>
          <Link
            to="/where-to-sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 font-semibold"
          >
            Where to Sell?
          </Link>
          <Link
            to="/price-trends"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Price Trends & Prediction
          </Link>
          {user?.role === "Buyer" && (
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Buyer Marketplace
          </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-600">
                Signed in as <span className="font-bold text-slate-800">{user?.full_name}</span> ({user?.role})
              </div>
              {user?.role === "Farmer" && (
                <Link
                  to="/farmer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Farmer Hub
                </Link>
              )}
              {user?.role === "Buyer" && (
                <Link
                  to="/buyer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50"
                >
                  Buyer Hub
                </Link>
              )}
              {user?.role === "FPO" && (
                <Link
                  to="/fpo-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  FPO Hub
                </Link>
              )}
              {user?.role === "Admin" && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50"
                >
                  Admin Desk
                </Link>
              )}
              <Link
                to="/offers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Negotiations & Offers
              </Link>
              <Link
                to="/transactions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Transactions
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
