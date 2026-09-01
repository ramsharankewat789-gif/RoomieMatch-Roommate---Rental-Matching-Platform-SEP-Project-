/**
 * ResetPasswordPage.jsx
 *
 * Reads ?token=...&email=... from the URL (sent in the forgot-password email).
 * Calls POST /api/auth/reset-password with token + email + newPassword.
 * On success redirects to /login.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiResetPassword } from "@shared/services/api";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (!token || !email) setInvalidLink(true);
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(token, email, password);
      setSuccess("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(
        err.message ||
          "Reset link is invalid or expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADeMePqBZADlSaGN2DpBmW6f6YM3nnDOHtFDHFZKlrAms-eK3OyHFRQB3Lrr_ep65YRntmyqsM3r4xVckoQy4oZtc5VtzZoVO-es-eNgvH8lcmr7SyMB0-Cvar29j5V3lun5cqvYKRqUdXlU-5ApoAggTU4j0W1aACxk7Jr-hUJEa1eyDkDDoaOAf1k5OHjnosDkhqDhnmVRcCzDEoUNYb4I_rbOELXypDYiSeZw6J6S7pDYd3weOT')",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/80 to-surface-container-low/90" />

      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">
              published_with_changes
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            New Password
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter a strong new password for your account.
          </p>
        </div>

        {/* Invalid link state */}
        {invalidLink && (
          <div className="space-y-4">
            <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-lg text-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>Invalid Reset Link</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                This password reset link is missing required parameters. Please
                request a new reset link.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              <span>Request New Link</span>
              <span className="material-symbols-outlined text-[20px]">
                send
              </span>
            </Link>
          </div>
        )}

        {/* Success state */}
        {success && !invalidLink && (
          <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-4 rounded-lg text-sm flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        {!invalidLink && !success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Resetting for */}
            {email && (
              <p className="text-xs text-on-surface-variant text-center">
                Resetting password for{" "}
                <span className="font-semibold text-on-surface">{email}</span>
              </p>
            )}

            <div className="space-y-1">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="password"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 pr-10 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-outline mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div className="space-y-1">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 pr-10 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all shadow-sm flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Updating...
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <span className="material-symbols-outlined text-[20px]">
                    save
                  </span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <Link
                to="/login"
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
