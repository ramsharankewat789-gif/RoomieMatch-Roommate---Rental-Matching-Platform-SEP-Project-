import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (idx, val) => {
    if (isNaN(Number(val))) return;
    const newCode = [...code];
    newCode[idx] = val.substring(val.length - 1);
    setCode(newCode);

    // Auto-focus next field
    if (val && idx < 5) {
      document.getElementById(`digit_${idx + 1}`).focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      document.getElementById(`digit_${idx - 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setSuccess("Email verified successfully!");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADeMePqBZADlSaGN2DpBmW6f6YM3nnDOHtFDHFZKlrAms-eK3OyHFRQB3Lrr_ep65YRntmyqsM3r4xVckoQy4oZtc5VtzZoVO-es-eNgvH8lcmr7SyMB0-Cvar29j5V3lun5cqvYKRqUdXlU-5ApoAggTU4j0W1aACxk7Jr-hUJEa1eyDkDDoaOAf1k5OHjnosDkhqDhnmVRcCzDEoUNYb4I_rbOELXypDYiSeZw6J6S7pDYd3weOT')",
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/80 to-surface-container-low/90"></div>

      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">mark_email_read</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            Verify Email
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter the 6-digit code sent to your student email.
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`digit_${idx}`}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                type="text"
                maxLength="1"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2"
          >
            <span>Verify & Continue</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="text-center pt-6 text-body-md text-on-surface-variant">
          Didn't receive the code?{" "}
          <button className="text-primary hover:text-surface-tint font-semibold font-label-md underline">
            Resend Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
