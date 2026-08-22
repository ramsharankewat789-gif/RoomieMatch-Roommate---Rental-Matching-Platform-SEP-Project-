import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate small delay
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      
      if (result.success) {
        if (result.user.role !== "admin") {
          logout();
          setError("This panel is for administrators. Use the user app (npm run dev:user).");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        setError(result.message);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md text-on-surface w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADeMePqBZADlSaGN2DpBmW6f6YM3nnDOHtFDHFZKlrAms-eK3OyHFRQB3Lrr_ep65YRntmyqsM3r4xVckoQy4oZtc5VtzZoVO-es-eNgvH8lcmr7SyMB0-Cvar29j5V3lun5cqvYKRqUdXlU-5ApoAggTU4j0W1aACxk7Jr-hUJEa1eyDkDDoaOAf1k5OHjnosDkhqDhnmVRcCzDEoUNYb4I_rbOELXypDYiSeZw6J6S7pDYd3weOT')",
        }}
      ></div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface/80 to-surface-container-low/90"></div>

      {/* Main Login Card */}
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">home_work</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            RoomieMatch Admin
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in to the admin panel
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-surface-container-low border border-outline-variant p-3 rounded-lg text-xs mb-6 text-on-surface-variant leading-relaxed">
          <p className="font-bold mb-1 text-primary">Demo Accounts (Password: <code className="bg-surface-container-high px-1 py-0.5 rounded">password123</code>):</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Admin: <code className="bg-surface-container-high px-1 py-0.5 rounded">admin@roomiematch.com</code></li>
          </ul>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input Group */}
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
              University Email
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

          {/* Password Input Group */}
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                id="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest transition-colors"
                type="checkbox"
              />
              <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                Remember me
              </span>
            </label>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            User accounts sign in on the client app (port 5173).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
