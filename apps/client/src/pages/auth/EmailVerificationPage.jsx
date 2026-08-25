/**
 * EmailVerificationPage.jsx
 *
 * Two modes:
 *
 * 1. Landing from email link (?token=...&email=...)
 *    → calls GET /api/auth/verify-email to confirm the token
 *    → shows success/failure and redirects to /login
 *
 * 2. No URL params (user navigated here manually / after registration)
 *    → shows "Send verification email" button
 *    → calls POST /api/auth/send-verification
 *    → user then checks their inbox and clicks the link
 */
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { apiSendVerificationEmail, apiVerifyEmail } from "@shared/services/api";

export const EmailVerificationPage = () => {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { currentUser, updateProfile } = useContext(AuthContext);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [status,   setStatus]   = useState("idle"); // idle | verifying | verified | error | sent
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);

  // ── Auto-verify when token+email in URL ──────────────────────────────────
  useEffect(() => {
    if (!token || !email) return;
    setStatus("verifying");
    apiVerifyEmail(token, email)
      .then(data => {
        setStatus("verified");
        setMessage(data.message || "Email verified successfully!");
        // Update context so the verified badge shows immediately
        updateProfile?.({ email_verified: true });
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch(err => {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may have expired.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  // ── Send verification email ───────────────────────────────────────────────
  const handleSend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await apiSendVerificationEmail();
      setStatus("sent");
      setMessage(data.message || "Verification email sent. Check your inbox.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

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
            <span className="material-symbols-outlined text-3xl font-bold">mark_email_read</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            Email Verification
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {token && email
              ? "Confirming your email address..."
              : "Verify your student email to unlock all features."}
          </p>
        </div>

        {/* Verifying spinner */}
        {status === "verifying" && (
          <div className="flex items-center justify-center gap-3 py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
            <span>Verifying your email...</span>
          </div>
        )}

        {/* Success */}
        {status === "verified" && (
          <div className="space-y-5">
            <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-4 rounded-xl text-sm font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-sm icon-fill mt-0.5">check_circle</span>
              <span>{message}</span>
            </div>
            <p className="text-xs text-on-surface-variant text-center">Redirecting to login...</p>
            <Link to="/login" className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint flex items-center justify-center gap-2 transition-all">
              <span className="material-symbols-outlined text-[20px]">login</span>
              Sign In Now
            </Link>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-5">
            <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-xl text-sm font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">error</span>
              <span>{message}</span>
            </div>
            {currentUser && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full border border-primary text-primary font-label-md text-label-md py-3 rounded-lg hover:bg-primary-container/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Sending...</>
                  : <><span className="material-symbols-outlined text-[20px]">send</span> Request New Link</>
                }
              </button>
            )}
            <Link to="/login" className="block text-center text-primary font-semibold text-sm hover:underline">
              Back to Sign In
            </Link>
          </div>
        )}

        {/* Sent confirmation */}
        {status === "sent" && (
          <div className="space-y-5">
            <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-4 rounded-xl text-sm font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-sm icon-fill mt-0.5">check_circle</span>
              <span>{message}</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Click the link in the email to verify your address. The link expires in 24 hours.
            </p>
            <Link to="/user/dashboard" className="block text-center text-primary font-semibold text-sm hover:underline">
              Continue to Dashboard
            </Link>
          </div>
        )}

        {/* Idle — no token in URL */}
        {status === "idle" && !token && (
          <div className="space-y-5">
            {currentUser?.email_verified ? (
              <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm icon-fill">check_circle</span>
                Your email is already verified.
              </div>
            ) : (
              <>
                <p className="text-body-md text-on-surface-variant text-sm leading-relaxed">
                  We will send a verification link to{" "}
                  <strong className="text-on-surface">{currentUser?.email || "your registered email"}</strong>.
                  Click the link in the email to verify your account.
                </p>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading
                    ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Sending...</>
                    : <><span>Send Verification Email</span><span className="material-symbols-outlined text-[20px]">send</span></>
                  }
                </button>
              </>
            )}
            <div className="text-center pt-2">
              <Link to="/user/profile" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                ← Back to Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
