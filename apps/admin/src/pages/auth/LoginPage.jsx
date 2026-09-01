/**
 * LoginPage.jsx (Admin)
 *
 * Email/password login + "Continue with Google" for admins.
 * Google flow identical to client, but backend will only proceed to
 * OTP if the found account has role === 'admin'.
 * Role is determined by the database — Google auth never grants admin privileges.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { apiGoogleAuth } from "@shared/services/api";

export const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithToken, logout } = useAuth();
  const navigate          = useNavigate();

  // ── Load Google Sign-In script ────────────────────────────────────────────
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src   = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback:  handleGoogleCredential,
        ux_mode:   "popup"
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-btn-admin"),
        { theme: "outline", size: "large", width: "100%", text: "continue_with" }
      );
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // ── Google credential callback ────────────────────────────────────────────
  const handleGoogleCredential = async (response) => {
    setGoogleLoading(true);
    setError("");
    try {
      const data = await apiGoogleAuth(response.credential);
      // Navigate to admin OTP page (same route, admin app)
      navigate("/verify-otp", {
        state: { pendingId: data.pendingId, email: data.email, isAdmin: true }
      });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email / password submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role !== "admin") {
        logout();
        setError("This panel is for administrators only. Use the user app (port 5173).");
      } else {
        navigate("/admin/dashboard");
      }
    } else {
      setError(result.message);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea]" />

      <div className="bg-white/95 backdrop-blur-sm w-full max-w-md rounded-2xl p-8 relative z-10 border border-white/20 shadow-[0px_8px_32px_rgba(102,126,234,0.2)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 shadow-lg">
            <img src="/images/logo.png" alt="RoomieMatch Admin" className="h-12 w-auto" />
          </div>
          <h1 className="font-headline-lg text-headline-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-1 tracking-tight">
            RoomieMatch Admin
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">
            Administrator Access Only
          </p>
          <p className="font-body-md text-body-md text-gray-600">
            Sign in to the admin panel
          </p>
        </div>

        {/* Demo credentials */}
        <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/30 p-3 rounded-xl text-xs mb-6 text-gray-700 leading-relaxed">
          <p className="font-bold mb-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            Demo Admin (Password: <code className="bg-white/80 px-1 py-0.5 rounded">password123</code>):
          </p>
          <ul className="list-disc pl-4">
            <li>Admin: <code className="bg-white/80 px-1 py-0.5 rounded">admin@roomiematch.com</code></li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        {googleClientId && (
          <>
            <div className="mb-4">
              {googleLoading ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 border border-[#667eea]/30 rounded-xl text-gray-600 text-sm bg-white">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Connecting to Google...
                </div>
              ) : (
                <div id="google-signin-btn-admin" className="w-full" />
              )}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#667eea]/30 to-transparent" />
              <span className="text-xs text-gray-500 font-semibold">or sign in with email</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#667eea]/30 to-transparent" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-gray-700" htmlFor="email">
              Admin Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#667eea] transition-colors">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@roomiematch.com"
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#667eea]/50 focus:border-[#667eea] transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#667eea] transition-colors">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#667eea]/50 focus:border-[#667eea] transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-label-md text-label-md py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#667eea]/50 active:scale-[0.98] transition-all duration-200 shadow-md flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="font-body-md text-body-md text-gray-500 text-xs">
            User accounts sign in on the client app (port 5173).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
