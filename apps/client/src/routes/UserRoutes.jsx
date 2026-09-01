import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout wrappers
import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";

// Public pages
import LandingPage from "../pages/public/LandingPage";

// Auth pages
import { AuthPage } from "../pages/auth/AuthPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import EmailVerificationPage from "../pages/auth/EmailVerificationPage";
import OtpVerificationPage from "../pages/auth/OtpVerificationPage";

// ── User pages (unified — search, apply, list, manage) ────────────────────
import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import LifestylePreferences from "../pages/user/LifestylePreferences";
import Verification from "../pages/user/Verification";
import PropertySearch from "../pages/user/PropertySearch";
import PropertyDetails from "../pages/user/PropertyDetails";
import RoommateSearch from "../pages/user/RoommateSearch";
import RoommateProfile from "../pages/user/RoommateProfile";
import Favorites from "../pages/user/Favorites";
import Applications from "../pages/user/Applications";
import ApplicationDetails from "../pages/user/ApplicationDetails";
import Messages from "../pages/user/Messages";
import Notifications from "../pages/user/Notifications";
import Reviews from "../pages/user/Reviews";
import MyProperties from "../pages/user/MyProperties";
import AddProperty from "../pages/user/AddProperty";
import EditProperty from "../pages/user/EditProperty";
import MyPropertyApplications from "../pages/user/MyPropertyApplications";
import MyPropertyApplicationDetails from "../pages/user/MyPropertyApplicationDetails";
import MyPropertyDetails from "../pages/user/MyPropertyDetails";
import PropertyMessages from "../pages/user/PropertyMessages";
import PropertyReviews from "../pages/user/PropertyReviews";
import PropertyVerification from "../pages/user/PropertyVerification";

export const UserRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ───────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
        </Route>

        {/* ── User (Client) Mode ───────────────────────────────────── */}
        <Route element={<UserLayout />}>
          {/* Dashboard */}
          <Route path="/user/dashboard" element={<Dashboard />} />

          {/* Roommate discovery */}
          <Route path="/user/roommates" element={<RoommateSearch />} />
          <Route path="/user/roommates/:id" element={<RoommateProfile />} />

          {/* Property searching */}
          <Route path="/user/properties" element={<PropertySearch />} />
          <Route path="/user/properties/:id" element={<PropertyDetails />} />
          <Route path="/user/favorites" element={<Favorites />} />

          {/* Applications (as applicant) */}
          <Route path="/user/applications" element={<Applications />} />
          <Route
            path="/user/applications/:id"
            element={<ApplicationDetails />}
          />

          {/* Managing own property listings */}
          <Route path="/user/my-properties" element={<MyProperties />} />
          <Route path="/user/my-properties/add" element={<AddProperty />} />
          <Route
            path="/user/my-properties/:id"
            element={<MyPropertyDetails />}
          />
          <Route
            path="/user/my-properties/:id/edit"
            element={<EditProperty />}
          />
          <Route
            path="/user/my-properties/applications"
            element={<MyPropertyApplications />}
          />
          <Route
            path="/user/my-properties/applications/:id"
            element={<MyPropertyApplicationDetails />}
          />
          <Route
            path="/user/my-properties/reviews"
            element={<PropertyReviews />}
          />

          {/* Communication */}
          <Route path="/user/messages" element={<Messages />} />
          <Route path="/user/notifications" element={<Notifications />} />

          {/* Reviews */}
          <Route path="/user/reviews" element={<Reviews />} />

          {/* Lifestyle & preferences */}
          <Route path="/user/preferences" element={<LifestylePreferences />} />

          {/* Verification */}
          <Route path="/user/verification" element={<Verification />} />

          {/* Profile */}
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/profile/edit" element={<EditProfile />} />

          {/* Legacy redirects */}
          <Route
            path="/tenant/*"
            element={<Navigate to="/user/dashboard" replace />}
          />
          <Route
            path="/owner/*"
            element={<Navigate to="/user/dashboard" replace />}
          />
        </Route>

        {/* Redirect admin traffic */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default UserRoutes;
