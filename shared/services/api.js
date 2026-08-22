/**
 * api.js — Thin fetch wrapper for all RoomieMatch API calls.
 *
 * - Reads the JWT from localStorage (set by AuthContext on login).
 * - All requests go to the Express server at http://localhost:4000.
 * - Never exposes secrets or tokens in URLs.
 */

const BASE_URL = "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("roomiematch_jwt") || null;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function apiRegister(name, email, password, role, phone) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role, phone })
  });
  return handleResponse(res);
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

/** Send Google ID token to backend for server-side validation + OTP dispatch. */
export async function apiGoogleAuth(credential) {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential })
  });
  return handleResponse(res);
}

/** Submit 6-digit OTP after Google sign-in. */
export async function apiVerifyOtp(pendingId, otp) {
  const res = await fetch(`${BASE_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pendingId, otp })
  });
  return handleResponse(res);
}

/** Resend OTP (60-second cooldown enforced server-side). */
export async function apiResendOtp(pendingId) {
  const res = await fetch(`${BASE_URL}/auth/otp/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pendingId })
  });
  return handleResponse(res);
}

export async function apiGetMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

// ── Profile image ──────────────────────────────────────────────────────────

export async function apiUploadProfileImage(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "POST",
    headers: authHeaders(),   // no Content-Type — browser sets multipart boundary
    body: form
  });
  return handleResponse(res);
}

export async function apiDeleteProfileImage() {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return handleResponse(res);
}

// ── Verification document ──────────────────────────────────────────────────

export async function apiUploadVerificationDoc(file, documentType) {
  const form = new FormData();
  form.append("document", file);
  form.append("document_type", documentType);
  const res = await fetch(`${BASE_URL}/verification`, {
    method: "POST",
    headers: authHeaders(),
    body: form
  });
  return handleResponse(res);
}

export async function apiGetVerificationStatus() {
  const res = await fetch(`${BASE_URL}/verification/status`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

/** Admin: URL for securely viewing a user's verification document. */
export function apiVerificationDocUrl(userId) {
  return `${BASE_URL}/verification/doc/${userId}`;
}

export async function apiApproveVerification(userId) {
  const res = await fetch(`${BASE_URL}/verification/${userId}/approve`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({})
  });
  return handleResponse(res);
}

export async function apiRejectVerification(userId, reason) {
  const res = await fetch(`${BASE_URL}/verification/${userId}/reject`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reason })
  });
  return handleResponse(res);
}

export async function apiListPendingVerifications() {
  const res = await fetch(`${BASE_URL}/verification/pending`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

// ── Property images ────────────────────────────────────────────────────────

export async function apiUploadPropertyImages(propertyId, files) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append("images", f));
  const res = await fetch(`${BASE_URL}/properties/${propertyId}/images`, {
    method: "POST",
    headers: authHeaders(),
    body: form
  });
  return handleResponse(res);
}

export async function apiGetPropertyImages(propertyId) {
  const res = await fetch(`${BASE_URL}/properties/${propertyId}/images`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function apiDeletePropertyImage(imageId) {
  const res = await fetch(`${BASE_URL}/properties/images/${imageId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function apiSetPrimaryPropertyImage(imageId) {
  const res = await fetch(`${BASE_URL}/properties/images/${imageId}/primary`, {
    method: "PATCH",
    headers: authHeaders()
  });
  return handleResponse(res);
}
