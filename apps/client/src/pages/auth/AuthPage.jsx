/**
 * AuthPage.jsx - Combined Login/Signup with sliding animation
 * Client panel only
 */
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useAuth } from "@shared/hooks/useAuth";
import { apiGoogleAuth } from "@shared/services/api";
import LoadingSpinner from "@shared/components/common/LoadingSpinner";
import "./AuthPage.css";

export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const { login, register } = useAuth();

  // Set initial state based on route - if /register, show register form
  const [isActive, setIsActive] = useState(location.pathname === "/register");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || "/user/dashboard";
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      const from = location.state?.from?.pathname || "/user/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    // Validation
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    // Phone validation — if provided, must have exactly 10 local digits
    if (regPhone.trim()) {
      const localDigits = regPhone
        .trim()
        .replace(/^\+?\d{1,3}[\s\-]?/, "")
        .replace(/\D/g, "");
      const allDigits = regPhone.trim().replace(/\D/g, "");
      // Accept formats: +977XXXXXXXXXX, 977XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
      // Local portion must be exactly 10 digits
      if (!/^\+?[\d\s\-().]{7,20}$/.test(regPhone.trim())) {
        setRegError(
          "Phone number contains invalid characters. Use digits, spaces, +, -, ( ) only.",
        );
        return;
      }
      // Extract local digits (strip leading country code if present)
      const stripped = allDigits.replace(/^(977|0)/, "");
      if (stripped.length !== 10) {
        setRegError(
          "Local phone number must be exactly 10 digits (e.g. 9812345678).",
        );
        return;
      }
    }

    setRegLoading(true);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
      });
      navigate("/verify-email", { state: { email: regEmail } });
    } catch (err) {
      setRegError(err.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("Google Sign-In is not configured.");
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const data = await apiGoogleAuth(response.credential);
            navigate("/verify-otp", {
              state: { pendingId: data.pendingId, email: data.email },
            });
          } catch (err) {
            setLoginError(err.message || "Google sign-in failed.");
          }
        },
      });
      window.google?.accounts.id.prompt();
    };
    document.head.appendChild(script);
  };

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-container ${isActive ? "active" : ""}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            {loginError && (
              <div className="error-message">
                <i className="bx bxs-error"></i>
                <span>{loginError}</span>
              </div>
            )}

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loginLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type={showLoginPw ? "text" : "password"}
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loginLoading}
              />
              <i
                className={`bx ${showLoginPw ? "bxs-hide" : "bxs-show"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowLoginPw((v) => !v)}
                title={showLoginPw ? "Hide password" : "Show password"}
              ></i>
            </div>

            <div className="forgot-link">
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="btn" disabled={loginLoading}>
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="newtons-cradle-mini">
                    <div className="newtons-cradle__dot-mini"></div>
                    <div className="newtons-cradle__dot-mini"></div>
                    <div className="newtons-cradle__dot-mini"></div>
                  </div>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Sign Up</h1>

            {regError && (
              <div className="error-message">
                <i className="bx bxs-error"></i>
                <span>{regError}</span>
              </div>
            )}

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                disabled={regLoading}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={regLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                disabled={regLoading}
              />
              <i className="bx bxs-phone"></i>
            </div>

            <div className="input-box">
              <input
                type={showRegPw ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={regLoading}
              />
              <i
                className={`bx ${showRegPw ? "bxs-hide" : "bxs-show"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowRegPw((v) => !v)}
                title={showRegPw ? "Hide password" : "Show password"}
              ></i>
            </div>

            <div className="input-box">
              <input
                type={showRegConfirmPw ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                disabled={regLoading}
              />
              <i
                className={`bx ${showRegConfirmPw ? "bxs-hide" : "bxs-show"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowRegConfirmPw((v) => !v)}
                title={showRegConfirmPw ? "Hide password" : "Show password"}
              ></i>
            </div>

            <button type="submit" className="btn" disabled={regLoading}>
              {regLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="newtons-cradle-mini">
                    <div className="newtons-cradle__dot-mini"></div>
                    <div className="newtons-cradle__dot-mini"></div>
                    <div className="newtons-cradle__dot-mini"></div>
                  </div>
                  Signing up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              className="btn register-btn"
              onClick={() => setIsActive(true)}
            >
              Sign Up
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className="btn login-btn"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
