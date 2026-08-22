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

  const { login, logout } = useAuth();
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

    setTimeout(() => {
      const result = login(email, password);
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
    }, 600);
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADeMePqBZADlSaGN2DpBmW6f6YM3nnDOHtFDHFZKlrAms-eK3OyHFRQB3Lrr_ep65YRntmyqsM3r4xVckoQy4oZtc5VtzZoVO-es-eNgvH8lcmr7SyMB0-Cvar29j5V3lun5cqvYKRqUdXlU-5ApoAggTU4j0W1aACxk7Jr-hUJEa1eyDkDDoaOAf1k5OHjnosDkhqDhnmVRcCzDEoUNYb4I_rbOELXypDYiSeZw6J6S7pDYd3weOT')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/80 to-surface-container-low/90" />

      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1 tracking-tight">
            RoomieMatch Admin
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-2">
            Administrator Access Only
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in to the admin panel
          </p>
        </div>

        {/* Demo credentials */}
        <div className="bg-surface-container-low border border-outline-variant p-3 rounded-lg text-xs mb-6 text-on-surface-variant leading-relaxed">
          <p className="font-bold mb-1 text-primary">
            Demo Admin (Password: <code className="bg-surface-container-high px-1 py-0.5 rounded">password123</code>):
          </p>
          <ul className="list-disc pl-4">
            <li>Admin: <code className="bg-surface-container-high px-1 py-0.5 rounded">admin@roomiematch.com</code></li>
          </ul>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        {googleClientId && (
          <>
            <div className="mb-4">
              {googleLoading ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-lg text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Connecting to Google...
                </div>
              ) : (
                <div id="google-signin-btn-admin" className="w-full" />
              )}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-outline font-semibold">or sign in with email</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
              Admin Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@roomiematch.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
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

        <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant text-xs">
            User accounts sign in on the client app (port 5173).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
