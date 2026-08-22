import React, { useState } from "react";
import { Link } from "react-router-dom";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      {/* Background Cover */}
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
            <span className="material-symbols-outlined text-3xl font-bold">lock_open</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-4 rounded-lg text-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Reset Email Sent</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                If the email address <strong>{email}</strong> is registered on RoomieMatch, you will receive password reset instructions shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                University Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                  id="email"
                  placeholder="student@university.edu"
                  required
                  type="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2"
            >
              <span>Send Instructions</span>
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
