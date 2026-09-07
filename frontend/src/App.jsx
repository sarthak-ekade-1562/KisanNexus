import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AIAdvisorChat from "./components/AIAdvisorChat";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MarketPricesPage from "./pages/MarketPricesPage";
import MarketComparisonPage from "./pages/MarketComparisonPage";
import WhereShouldISellPage from "./pages/WhereShouldISellPage";
import PriceTrendsPage from "./pages/PriceTrendsPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import CreateLotPage from "./pages/CreateLotPage";
import BuyerMarketplacePage from "./pages/BuyerMarketplacePage";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerRequirementsPage from "./pages/BuyerRequirementsPage";
import OffersPage from "./pages/OffersPage";
import TransactionsPage from "./pages/TransactionsPage";
import PriceAlertsPage from "./pages/PriceAlertsPage";
import FPODashboard from "./pages/FPODashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/market-prices" element={<MarketPricesPage />} />
              <Route path="/compare-markets" element={<MarketComparisonPage />} />
              <Route path="/where-to-sell" element={<WhereShouldISellPage />} />
              <Route path="/price-trends" element={<PriceTrendsPage />} />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute allowedRoles={["Buyer"]}>
                    <BuyerMarketplacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requirements"
                element={
                  <ProtectedRoute allowedRoles={["Buyer"]}>
                    <BuyerRequirementsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/buyer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Buyer"]}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Farmer", "Admin"]}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-lot"
                element={
                  <ProtectedRoute allowedRoles={["Farmer", "FPO", "Admin"]}>
                    <CreateLotPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offers"
                element={
                  <ProtectedRoute>
                    <OffersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/price-alerts"
                element={
                  <ProtectedRoute allowedRoles={["Farmer", "Admin"]}>
                    <PriceAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fpo-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["FPO", "Admin"]}>
                    <FPODashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <AIAdvisorChat />
        </div>
      </Router>
    </AuthProvider>
  );
}
