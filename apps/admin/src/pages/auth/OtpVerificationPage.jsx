/**
 * OtpVerificationPage.jsx
 *
 * Shown after Google sign-in to collect the 6-digit OTP sent to Gmail.
 * State is passed via React Router location.state:
 *   { pendingId, email, isNewUser }
 *
 * Security notes:
 *  - OTP is never stored in state beyond the input fields
 *  - OTP is never shown, logged, or put in URLs
 *  - All verification logic runs on the backend
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { apiVerifyOtp, apiResendOtp } from "@shared/services/api";

const RESEND_COOLDOWN = 60;

export const OtpVerificationPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loginWithToken } = useAuth();

  const { pendingId, email, isNewUser } = location.state || {};

  const [digits, setDigits]         = useState(["", "", "", "", "", ""]);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendMsg, setResendMsg]   = useState("");
  const [attemptsLeft, setAttemptsLeft]     = useState(null);

  const inputRefs = useRef([]);

  // Redirect if navigated here without pendingId
  useEffect(() => {
    if (!pendingId || !email) {
      navigate("/login", { replace: true });
    }
  }, [pendingId, email, navigate]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(timer); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Mask email: r*****n@gmail.com
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c)
    : "";

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;          // digits only
    const next = [...digits];
    next[idx] = val.slice(-1);               // take last char (handles paste of 1 digit)
    setDigits(next);
    setError("");

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft"  && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  // Support paste of full 6-digit code into any field
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);
    // Focus last filled cell or end
    const lastIdx = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiVerifyOtp(pendingId, code);
      // data: { token, user, isNewUser }
      loginWithToken(data.token, data.user);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.isNewUser) {
        navigate("/user/profile/edit", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err.message || "Invalid verification code.";
      setError(msg);

      // Extract attemptsLeft if included in error message
      const match = msg.match(/(\d+) attempt/);
      if (match) setAttemptsLeft(Number(match[1]));

      // If too many attempts, clear digits and refocus first field
      if (msg.toLowerCase().includes("too many")) {
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMsg("");
    setError("");
    try {
      await apiResendOtp(pendingId);
      setResendMsg("A new code has been sent to your Gmail.");
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(["", "", "", "", "", ""]);
      setAttemptsLeft(null);
      inputRefs.current[0]?.focus();
    } catch (err) {
      // Server returns secondsLeft for cooldown errors
      const msg = err.message || "Failed to resend code.";
      const match = msg.match(/(\d+) second/);
      if (match) {
        setResendCooldown(Number(match[1]));
      }
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  if (!pendingId || !email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADeMePqBZADlSaGN2DpBmW6f6YM3nnDOHtFDHFZKlrAms-eK3OyHFRQB3Lrr_ep65YRntmyqsM3r4xVckoQy4oZtc5VtzZoVO-es-eNgvH8lcmr7SyMB0-Cvar29j5V3lun5cqvYKRqUdXlU-5ApoAggTU4j0W1aACxk7Jr-hUJEa1eyDkDDoaOAf1k5OHjnosDkhqDhnmVRcCzDEoUNYb4I_rbOELXypDYiSeZw6J6S7pDYd3weOT')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/80 to-surface-container-low/90" />

      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            Verify Your Identity
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter the 6-digit code sent to
          </p>
          <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
            {maskedEmail}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold mb-5 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">warning</span>
            <span>{error}{attemptsLeft !== null && ` (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left)`}</span>
          </div>
        )}

        {/* Resend success */}
        {resendMsg && !error && (
          <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-3 rounded-lg text-xs font-semibold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {resendMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-digit OTP inputs */}
          <div
            className="flex justify-between gap-2"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp_${idx}`}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                autoComplete="one-time-code"
                className={`w-12 h-14 text-center border-2 rounded-xl bg-surface-container-lowest text-on-surface text-xl font-bold focus:outline-none transition-all duration-200 ${
                  error
                    ? "border-error focus:ring-2 focus:ring-error"
                    : digit
                    ? "border-primary focus:ring-2 focus:ring-primary"
                    : "border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                }`}
                aria-label={`Digit ${idx + 1}`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || digits.join("").length < 6}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Verifying...
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Resend section */}
        <div className="mt-6 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            Didn't receive the code?
          </p>
          {resendCooldown > 0 ? (
            <p className="text-sm text-outline font-semibold">
              Resend available in{" "}
              <span className="text-primary font-bold tabular-nums">{resendCooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors font-bold underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
