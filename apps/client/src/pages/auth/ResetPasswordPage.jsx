import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSuccess("Password has been reset successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
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
            <span className="material-symbols-outlined text-3xl font-bold">published_with_changes</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            New Password
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter a strong new password for your account.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
              New Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block font-label-md text-label-md text-on-surface"
              htmlFor="confirmPassword"
            >
              Confirm New Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="confirmPassword"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-4"
          >
            <span>Update Password</span>
            <span className="material-symbols-outlined text-[20px]">save</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
