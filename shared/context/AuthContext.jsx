/**
 * AuthContext.jsx
 *
 * Hybrid authentication context — supports both:
 *   1. Mock/localStorage mode (demo accounts, works without backend)
 *   2. Real JWT mode (Google OAuth + OTP flow, uses backend API)
 *
 * loginWithToken(token, user) — called after successful OTP verification.
 * JWT is stored in localStorage under 'roomiematch_jwt' so api.js can read it.
 *
 * switchUser is preserved for internal dev use only (not exposed in UI).
 * Role is ALWAYS read from the stored user object — never derived from JWT alone.
 */
import React, { createContext, useState, useEffect } from "react";
import { mockUsers } from "../data/mockUsers";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("roomiematch_users");
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("roomiematch_currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  // Persist users list
  useEffect(() => {
    localStorage.setItem("roomiematch_users", JSON.stringify(users));
  }, [users]);

  // Persist current user + sync users list entry
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("roomiematch_currentUser", JSON.stringify(currentUser));
      setUsers((prev) =>
        prev.some((u) => u.id === currentUser.id)
          ? prev.map((u) => (u.id === currentUser.id ? currentUser : u))
          : [...prev, currentUser]
      );
    } else {
      localStorage.removeItem("roomiematch_currentUser");
    }
  }, [currentUser]);

  // ── Mock email/password login (localStorage) ────────────────────────────
  const login = (email, password) => {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password." };
  };

  // ── Real JWT login (called after OTP verification) ──────────────────────
  // token  — JWT from backend (stored in localStorage for API calls)
  // user   — user object from backend response
  const loginWithToken = (token, user) => {
    if (token) {
      localStorage.setItem("roomiematch_jwt", token);
    }
    // Normalise backend user to match frontend shape
    const normalised = {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      role:        user.role || "user",
      avatar:      user.profile_image || user.avatar || null,
      phone:       user.phone || "",
      university:  user.university || "",
      major:       user.major || "",
      age:         user.age || 20,
      gender:      user.gender || "Other",
      budget:      user.budget || "$500 - $1,000",
      bio:         user.bio || "",
      hobbies:     Array.isArray(user.hobbies) ? user.hobbies : [],
      preferences: typeof user.preferences === "object" ? user.preferences : {},
      isVerified:  Boolean(user.is_verified || user.isVerified),
      verificationDoc: user.verificationDoc || { status: "Unverified" }
    };
    setCurrentUser(normalised);
    return { success: true, user: normalised };
  };

  // ── Registration (localStorage mock) ────────────────────────────────────
  const register = (userData) => {
    const exists = users.some(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) return { success: false, message: "Email already registered." };

    const newUser = {
      id:          "u_" + Date.now(),
      name:        userData.name,
      email:       userData.email,
      password:    userData.password,
      role:        "user",
      isVerified:  false,
      avatar:      userData.avatar || null,
      phone:       userData.phone || "",
      university:  userData.university || "",
      major:       userData.major || "",
      age:         Number(userData.age) || 20,
      gender:      userData.gender || "Other",
      budget:      userData.budget || "$500 - $1,000",
      bio:         userData.bio || "",
      preferences: {
        smoke:   userData.smoke   || "No",
        pet:     userData.pet     || "No Pets",
        clean:   userData.clean   || "Medium",
        sleep:   userData.sleep   || "Early Bird",
        social:  userData.social  || "Medium",
        cooking: userData.cooking || "Sometimes"
      },
      hobbies:     userData.hobbies || [],
      properties:  [],
      verificationDoc: { status: "Unverified", type: "ID Document", submittedAt: null }
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("roomiematch_jwt");
    setCurrentUser(null);
  };

  // ── Profile update (localStorage) ───────────────────────────────────────
  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
  };

  // ── Dev-only: switch active user without credential check ────────────────
  const switchUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        loginWithToken,
        register,
        logout,
        updateProfile,
        switchUser,
        setUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
