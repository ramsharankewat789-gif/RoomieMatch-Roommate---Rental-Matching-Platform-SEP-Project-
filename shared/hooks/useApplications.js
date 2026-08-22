/**
 * useApplications.js — Real API hook for rental applications.
 *
 * Replaces the localStorage/mockApplications implementation.
 * All data comes from /api/applications endpoints.
 *
 * Usage:
 *   const { applications, loading, error, reload,
 *           applyForProperty, updateApplicationStatus, cancelApplication }
 *     = useApplications(params);
 *
 * params — optional query object forwarded to GET /api/applications
 *   e.g. { status, propertyId, page, limit }
 */
import { useState, useEffect, useCallback } from "react";
import {
  apiListApplications,
  apiSubmitApplication,
  apiUpdateApplicationStatus,
  apiCancelApplication,
} from "../services/api";

export const useApplications = (params = {}) => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const paramKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiListApplications(params);
      setApplications(data.applications || []);
      setPagination(data.pagination     || null);
    } catch (err) {
      // If user is not logged in the request will 401 — swallow gracefully
      if (!err.message?.includes("401") && !err.message?.includes("Authentication")) {
        setError(err.message || "Failed to load applications.");
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  useEffect(() => { load(); }, [load]);

  // ── Submit / apply ────────────────────────────────────────────────────────
  /**
   * applyForProperty(propertyId, message)
   * Returns { success: true, application } or { success: false, message }
   */
  const applyForProperty = async (propertyId, message = "") => {
    try {
      const data = await apiSubmitApplication(propertyId, message);
      await load(); // Refresh list so the new application appears
      return { success: true, application: data.application };
    } catch (err) {
      return { success: false, message: err.message || "Failed to submit application." };
    }
  };

  // ── Owner: approve / reject ────────────────────────────────────────────
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const data = await apiUpdateApplicationStatus(applicationId, status);
      setApplications(prev =>
        prev.map(a => (a.id === applicationId ? { ...a, status: data.application.status } : a))
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Tenant: cancel ────────────────────────────────────────────────────────
  const cancelApplication = async (applicationId) => {
    try {
      await apiCancelApplication(applicationId);
      setApplications(prev =>
        prev.map(a => (a.id === applicationId ? { ...a, status: "cancelled" } : a))
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return {
    applications,
    pagination,
    loading,
    error,
    reload: load,
    applyForProperty,
    updateApplicationStatus,
    cancelApplication,
    // Legacy compat alias
    setApplications,
  };
};
