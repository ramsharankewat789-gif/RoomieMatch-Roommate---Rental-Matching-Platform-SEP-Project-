/**
 * AuthContext.jsx
 *
 * Authentication context — real MySQL/JWT backend.
 *
 * login(email, password)       — POST /api/auth/login  → JWT stored, user set
 * register(userData)           — POST /api/auth/register → JWT stored, user set
 * loginWithToken(token, user)  — called after Google OTP verification
 * logout()                     — clears JWT + user state
 * updateProfile(fields)        — local state update after PATCH /api/users/:id
 *
 * JWT is stored in localStorage under 'roomiematch_jwt'.
 * api.js reads it automatically for authenticated requests.
 *
 * On page reload the stored JWT is re-validated against /api/auth/me so
 * revoked or expired sessions are caught immediately.
 */
import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiRegister, apiGetMe } from "../services/api";

export const AuthContext = createContext();

// ── Normalise backend user → frontend shape ──────────────────────────────
function normaliseUser(user) {
  return {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    role:        user.role || "user",
    avatar:      user.profile_image || user.avatar || null,
    phone:       user.phone        || "",
    university:  user.university   || "",
    major:       user.major        || "",
    age:         user.age          || null,
    gender:      user.gender       || "",
    budget_min:  user.budget_min   || null,
    budget_max:  user.budget_max   || null,
    bio:         user.bio          || "",
    hobbies:     Array.isArray(user.hobbies) ? user.hobbies : [],
    preferences: (user.preferences && typeof user.preferences === "object")
                   ? user.preferences : {},
    isVerified:  Boolean(user.is_verified || user.isVerified),
    email_verified: Boolean(user.email_verified),
    verificationDoc: user.verificationDoc || { status: "NOT_SUBMITTED" }
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true while rehydrating from JWT

  // ── On mount: rehydrate session from stored JWT ───────────────────────
  useEffect(() => {
    const jwt = localStorage.getItem("roomiematch_jwt");
    if (!jwt) {
      setAuthLoading(false);
      return;
    }
    // Validate JWT against backend — catches expired/revoked tokens
    apiGetMe()
      .then(data => {
        setCurrentUser(normaliseUser(data.user));
      })
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem("roomiematch_jwt");
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Email / password login — real API ────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem("roomiematch_jwt", data.token);
      const user = normaliseUser(data.user);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message || "Invalid email or password." };
    }
  }, []);

  // ── Registration — real API ───────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      const data = await apiRegister(
        userData.name,
        userData.email,
        userData.password,
        userData.phone || ""
      );
      localStorage.setItem("roomiematch_jwt", data.token);
      const user = normaliseUser(data.user);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message || "Registration failed." };
    }
  }, []);

  // ── Real JWT login (called after Google OTP verification) ────────────
  const loginWithToken = useCallback((token, user) => {
    if (token) localStorage.setItem("roomiematch_jwt", token);
    const normalised = normaliseUser(user);
    setCurrentUser(normalised);
    return { success: true, user: normalised };
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("roomiematch_jwt");
    setCurrentUser(null);
  }, []);

  // ── Local profile update (after PATCH /api/users/:id succeeds) ───────
  const updateProfile = useCallback((updatedFields) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedFields };
      // Re-normalise so shape stays consistent
      return normaliseUser(merged);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        register,
        loginWithToken,
        logout,
        updateProfile,
        // Expose setter for edge cases (profile image upload etc.)
        setCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
