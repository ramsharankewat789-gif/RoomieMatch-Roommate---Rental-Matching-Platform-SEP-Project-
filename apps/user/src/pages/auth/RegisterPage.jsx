import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("tenant"); // tenant or owner
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = register({
        name,
        email,
        password,
        role,
        phone
      });
      setLoading(false);

      if (result.success) {
        setSuccess("Registration successful! Redirecting you now...");
        setTimeout(() => {
          if (role === "tenant") {
            navigate("/tenant/dashboard");
          } else {
            navigate("/owner/dashboard");
          }
        }, 1500);
      } else {
        setError(result.message);
      }
    }, 800);
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

      {/* Register Card */}
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-8 relative z-10 border border-outline-variant/40 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 tracking-tight">
            Create Profile
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Join the RoomieMatch university network
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

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="name">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="name"
              placeholder="Alex Mercer"
              required
              type="text"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
              University Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="email"
              placeholder="student@university.edu"
              required
              type="email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="phone">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="phone"
              placeholder="+1 (555) 012-3456"
              type="tel"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`py-3 px-4 rounded-lg border text-center font-bold text-label-md transition-all duration-200 ${
                  role === "tenant"
                    ? "bg-primary-container text-on-primary-container border-primary"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                Tenant / Student
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-3 px-4 rounded-lg border text-center font-bold text-label-md transition-all duration-200 ${
                  role === "owner"
                    ? "bg-primary-container text-on-primary-container border-primary"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                Owner / Landlord
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
              Password
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              className="block font-label-md text-label-md text-on-surface"
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
              id="confirm-password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
          >
            <span>{loading ? "Creating Profile..." : "Register Profile"}</span>
            {!loading && <span className="material-symbols-outlined text-[20px]">person_add</span>}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
