/**
 * useProperties.js — Real API hook for property data.
 *
 * Replaces the localStorage/mockProperties implementation.
 * All data comes from POST/GET /api/properties endpoints.
 *
 * Usage:
 *   const { properties, loading, error, reload,
 *           createProperty, editProperty, deleteProperty } = useProperties(params);
 *
 * params — optional query object forwarded to GET /api/properties
 *   e.g. { ownerId, status, verified, search, city, page, limit }
 */
import { useState, useEffect, useCallback } from "react";
import {
  apiListProperties,
  apiCreateProperty,
  apiUpdateProperty,
  apiDeleteProperty,
  apiVerifyProperty,
  apiUpdatePropertyStatus,
  apiUploadPropertyImages,
} from "../services/api";

export const useProperties = (params = {}) => {
  const [properties, setProperties]   = useState([]);
  const [pagination, setPagination]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Serialise params so the effect re-runs when they change
  const paramKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiListProperties(params);
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  useEffect(() => { load(); }, [load]);

  // ── Create ───────────────────────────────────────────────────────────────
  const createProperty = async (propData, imageFiles = []) => {
    const data = await apiCreateProperty({
      title:          propData.title,
      address:        propData.address,
      city:           propData.city           || "Metro City",
      type:           propData.type           || "Apartment",
      bedrooms:       Number(propData.bedrooms)  || 1,
      bathrooms:      Number(propData.bathrooms) || 1,
      price:          Number(propData.price),
      deposit:        Number(propData.deposit)   || Number(propData.price),
      description:    propData.description   || "",
      available_from: propData.availableFrom || propData.available_from || null,
      amenities:      propData.amenities     || [],
      rules:          propData.rules         || [],
    });

    const property = data.property;

    // Upload images immediately after creation
    if (imageFiles.length > 0) {
      try {
        await apiUploadPropertyImages(property.id, imageFiles);
      } catch (imgErr) {
        console.warn("[useProperties] Image upload failed:", imgErr.message);
      }
    }

    await load(); // Refresh list
    return property;
  };

  // ── Update ───────────────────────────────────────────────────────────────
  const editProperty = async (propertyId, updatedFields) => {
    const data = await apiUpdateProperty(propertyId, updatedFields);
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, ...data.property } : p))
    );
    return data.property;
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteProperty = async (propertyId) => {
    await apiDeleteProperty(propertyId);
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  // ── Admin: verify ────────────────────────────────────────────────────────
  const verifyProperty = async (propertyId) => {
    await apiVerifyProperty(propertyId);
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, is_verified: 1, isVerified: true } : p))
    );
  };

  // ── Owner: status toggle ─────────────────────────────────────────────────
  const updateStatus = async (propertyId, status) => {
    await apiUpdatePropertyStatus(propertyId, status);
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, status } : p))
    );
  };

  return {
    properties,
    pagination,
    loading,
    error,
    reload: load,
    createProperty,
    editProperty,
    deleteProperty,
    verifyProperty,
    updateStatus,
    // Legacy compat aliases used by a few pages
    addProperty: createProperty,
    setProperties,
  };
};
