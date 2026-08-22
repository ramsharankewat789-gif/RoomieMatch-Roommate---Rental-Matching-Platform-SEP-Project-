/**
 * RegisterPage.jsx
 *
 * Registration with optional profile image upload.
 * Profile image ≠ identity verification — uploading a photo never affects
 * verification status. These are separate systems.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { apiUploadProfileImage } from "@shared/services/api";
import { SingleImageUpload } from "@shared/components/common/ImageUpload";

export const RegisterPage = () => {
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]                   = useState("tenant");
  const [phone, setPhone]                 = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview]     = useState(null);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate      = useNavigate();

  // Preview selected image locally (no upload yet — happens after registration)
  const handleImageSelect = (file) => {
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProfilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // 1. Register via existing localStorage-based AuthContext
    const result = register({ name, email, password, role, phone });
    if (!result.success) {
      setLoading(false);
      setError(result.message);
      return;
    }

    // 2. If a profile image was selected, upload it to backend
    //    This does NOT affect verification status — profile image is separate
    if (profileImageFile) {
      try {
        // Store JWT from registration if available (for real-backend flow)
        const data = await apiUploadProfileImage(profileImageFile);
        // Update local user's avatar with the returned URL
        if (data.imageUrl) {
          // Persist into localStorage user object
          const stored = localStorage.getItem("roomiematch_currentUser");
          if (stored) {
            const user = JSON.parse(stored);
            user.avatar = `http://localhost:4000${data.imageUrl}`;
            localStorage.setItem("roomiematch_currentUser", JSON.stringify(user));
          }
        }
      } catch {
        // Non-fatal — profile image upload failure doesn't block registration
        console.warn("Profile image upload failed — continuing without it");
      }
    }

    setSuccess("Registration successful! Redirecting...");
    setLoading(false);

    setTimeout(() => navigate("/user/dashboard"), 1200);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Profile photo (optional) ────────────────────────────── */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-outline">person</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-surface-tint transition-colors">
              <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
              {profilePreview ? "Change photo" : "Add profile photo (optional)"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageSelect(f);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="text-[10px] text-outline text-center">
              JPG, PNG or WEBP · Max 5 MB · This is your profile photo, not an ID verification document
            </p>
          </div>

          {/* Full name */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="name">Full Name</label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Mercer" required
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">University Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu" required
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="phone">Phone Number</label>
            <input
              id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 012-3456"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              {[["tenant", "Tenant / Student"], ["owner", "Owner / Landlord"]].map(([val, label]) => (
                <button
                  key={val} type="button" onClick={() => setRole(val)}
                  className={`py-3 px-4 rounded-lg border text-center font-bold text-label-md transition-all duration-200 ${
                    role === val
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint active:scale-[0.98] transition-all shadow-sm flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Creating Profile...
              </>
            ) : (
              <>
                <span>Register Profile</span>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
