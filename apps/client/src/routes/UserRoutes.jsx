import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout wrappers
import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";

// Public pages
import LandingPage from "../pages/public/LandingPage";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import EmailVerificationPage from "../pages/auth/EmailVerificationPage";
import OtpVerificationPage from "../pages/auth/OtpVerificationPage";

// ── Tenant pages ───────────────────────────────────────────────────────────────
import TenantDashboard from "../pages/tenant/TenantDashboard";
import TenantProfile from "../pages/tenant/TenantProfile";
import EditTenantProfile from "../pages/tenant/EditTenantProfile";
import LifestylePreferences from "../pages/tenant/LifestylePreferences";
import TenantVerification from "../pages/tenant/TenantVerification";
import PropertySearch from "../pages/tenant/PropertySearch";
import PropertyDetails from "../pages/tenant/PropertyDetails";
import RoommateSearch from "../pages/tenant/RoommateSearch";
import RoommateProfile from "../pages/tenant/RoommateProfile";
import Favorites from "../pages/tenant/Favorites";
import Applications from "../pages/tenant/Applications";
import ApplicationDetails from "../pages/tenant/ApplicationDetails";
import Messages from "../pages/tenant/Messages";
import Notifications from "../pages/tenant/Notifications";
import Reviews from "../pages/tenant/Reviews";

// ── Owner pages ────────────────────────────────────────────────────────────────
import MyProperties from "../pages/owner/MyProperties";
import AddProperty from "../pages/owner/AddProperty";
import EditProperty from "../pages/owner/EditProperty";
import OwnerApplications from "../pages/owner/OwnerApplications";
import OwnerApplicationDetails from "../pages/owner/OwnerApplicationDetails";
import OwnerPropertyDetails from "../pages/owner/OwnerPropertyDetails";
import OwnerMessages from "../pages/owner/OwnerMessages";
import OwnerReviews from "../pages/owner/OwnerReviews";
import OwnerVerification from "../pages/owner/OwnerVerification";

export const UserRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ───────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/verify-otp"   element={<OtpVerificationPage />} />
        </Route>

        {/* ── User (Client) Mode ───────────────────────────────────── */}
        <Route element={<UserLayout />}>
          {/* Dashboard */}
          <Route path="/user/dashboard" element={<TenantDashboard />} />

          {/* Roommate discovery */}
          <Route path="/user/roommates" element={<RoommateSearch />} />
          <Route path="/user/roommates/:id" element={<RoommateProfile />} />

          {/* Property searching & browsing */}
          <Route path="/user/properties" element={<PropertySearch />} />
          <Route path="/user/properties/:id" element={<PropertyDetails />} />
          <Route path="/user/favorites" element={<Favorites />} />

          {/* Renting — applying for properties */}
          <Route path="/user/applications" element={<Applications />} />
          <Route path="/user/applications/:id" element={<ApplicationDetails />} />

          {/* Listing — managing own properties */}
          <Route path="/user/my-properties" element={<MyProperties />} />
          <Route path="/user/my-properties/add" element={<AddProperty />} />
          <Route path="/user/my-properties/:id" element={<OwnerPropertyDetails />} />
          <Route path="/user/my-properties/:id/edit" element={<EditProperty />} />
          <Route path="/user/my-properties/applications" element={<OwnerApplications />} />
          <Route path="/user/my-properties/applications/:id" element={<OwnerApplicationDetails />} />
          <Route path="/user/my-properties/reviews" element={<OwnerReviews />} />

          {/* Communication */}
          <Route path="/user/messages" element={<Messages />} />
          <Route path="/user/notifications" element={<Notifications />} />

          {/* Reviews (as a renter) */}
          <Route path="/user/reviews" element={<Reviews />} />

          {/* Lifestyle & preferences */}
          <Route path="/user/preferences" element={<LifestylePreferences />} />

          {/* Verification */}
          <Route path="/user/verification" element={<TenantVerification />} />

          {/* Profile */}
          <Route path="/user/profile" element={<TenantProfile />} />
          <Route path="/user/profile/edit" element={<EditTenantProfile />} />

          {/* Legacy redirects */}
          <Route path="/tenant/*" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/owner/*" element={<Navigate to="/user/dashboard" replace />} />
        </Route>

        {/* Redirect admin traffic to the admin server */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default UserRoutes;
