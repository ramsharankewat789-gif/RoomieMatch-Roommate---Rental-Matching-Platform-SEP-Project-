/**
 * AdminPropertyDetails.jsx (Admin)
 *
 * Loads property from GET /api/properties/:id (real API).
 * Loads related reports from GET /api/reports?reported_property_id=:id.
 * Approve via PATCH /api/properties/:id/verify.
 * Reject (delete) via DELETE /api/properties/:id.
 * No mock data. No AuthContext.users. No localStorage.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetProperty, apiVerifyProperty, apiDeleteProperty, apiListReports } from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";
import Textarea from "@shared/components/common/Textarea";

export const AdminPropertyDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [property,        setProperty]        = useState(null);
  const [propertyReports, setPropertyReports] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [pageError,       setPageError]       = useState("");
  const [moderatorNotes,  setModeratorNotes]  = useState("");
  const [actionLoading,   setActionLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propData, reportsData] = await Promise.all([
          apiGetProperty(id),
          apiListReports({ limit: 50 }).catch(() => ({ reports: [] })),
        ]);
        setProperty(propData.property);
        // Filter reports that concern this property
        const related = (reportsData.reports || []).filter(
          r => r.reported_property_id === id
        );
        setPropertyReports(related);
      } catch (err) {
        setPageError(err.message || "Property not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await apiVerifyProperty(id);
      setProperty(prev => ({ ...prev, is_verified: 1 }));
      navigate("/admin/properties");
    } catch (err) {
      alert(err.message || "Failed to approve listing.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm(`Delete "${property?.title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await apiDeleteProperty(id);
      navigate("/admin/properties");
    } catch (err) {
      alert(err.message || "Failed to delete listing.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading property...
      </div>
    );
  }

  if (pageError || !property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl p-8">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">Property Not Found</h3>
        <p className="text-body-md text-on-surface-variant mt-2">{pageError}</p>
        <Link to="/admin/properties" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Property Queue
        </Link>
      </div>
    );
  }

  const coverImage = property.cover_image || property.images?.[0] || null;
  const verified   = property.is_verified === 1 || property.is_verified === true;
  const owner      = property.owner || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link
            to="/admin/properties"
            className="text-on-surface-variant hover:text-primary flex items-center gap-1 font-label-md text-label-md mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Property Queue
          </Link>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <StatusBadge status={verified ? "verified" : "unverified"} />
            <StatusBadge status={property.status} />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{property.title}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {property.address}, {property.city}
          </p>
        </div>
        {propertyReports.length > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 border border-error/40 text-error rounded-lg font-label-md text-label-md bg-error-container/10">
            <span className="material-symbols-outlined text-sm">flag</span>
            {propertyReports.length} Report{propertyReports.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left — Images + Description */}
        <div className="lg:col-span-8 space-y-6">

          {/* Image gallery */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            {coverImage ? (
              <div className="grid grid-cols-4 grid-rows-2 gap-1 h-80">
                <div className="col-span-4 md:col-span-3 row-span-2 overflow-hidden">
                  <img src={coverImage} alt={property.title} className="w-full h-full object-cover" />
                </div>
                {(property.images || []).slice(1, 3).map((img, i) => (
                  <div key={i} className="hidden md:block col-span-1 row-span-1 overflow-hidden">
                    <img src={img} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-outline bg-surface-container">
                <span className="material-symbols-outlined text-[64px]">home_work</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-6 border-b border-outline-variant/60 pb-4">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Property Description</h2>
                <div className="flex gap-4 text-body-md text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bed</span>
                    {property.bedrooms} Bed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bathtub</span>
                    {property.bathrooms} Bath
                  </span>
                  <span>{property.type}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline-lg text-headline-lg text-primary">
                  ${property.price}
                  <span className="font-body-md text-body-md text-on-surface-variant font-normal">/mo</span>
                </div>
                {property.available_from && (
                  <div className="text-xs text-outline mt-1">
                    Available: {new Date(property.available_from).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {property.description || "No description provided."}
            </p>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-outline-variant/60">
                <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(a => (
                    <span key={a} className="bg-surface-container px-3 py-1 rounded-full text-xs font-semibold text-on-surface border border-outline-variant/60">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related reports */}
          {propertyReports.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-error/40 p-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center justify-between">
                User Reports
                <span className="bg-error-container text-on-error-container text-xs px-2 py-1 rounded-full font-bold">
                  {propertyReports.length}
                </span>
              </h3>
              <div className="space-y-3">
                {propertyReports.map(rep => (
                  <div key={rep.id} className="p-3 bg-error-container/10 border border-error-container/40 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-md text-label-md text-on-surface font-bold">{rep.title}</span>
                      <StatusBadge status={rep.status} />
                    </div>
                    <p className="text-body-md text-on-surface-variant text-sm">{rep.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Actions + Owner */}
        <div className="lg:col-span-4 space-y-4">

          {/* Moderation Actions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-primary p-6 sticky top-24">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              Moderation
            </h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Review this listing before approving it to the public marketplace.
            </p>
            <div className="flex flex-col gap-3">
              {!verified && (
                <Button
                  variant="secondary"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {actionLoading ? "Processing..." : "Approve Listing"}
                </Button>
              )}
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                {actionLoading ? "Processing..." : "Remove Listing"}
              </Button>
            </div>
            <div className="mt-4">
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Internal Notes
              </label>
              <Textarea
                placeholder="Add notes about your decision..."
                rows={3}
                value={moderatorNotes}
                onChange={e => setModeratorNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Owner card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 border-b border-outline-variant/60 pb-2">
              Owner Details
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={owner.profile_image} name={owner.name} size="md" />
              <div>
                <p className="font-label-md text-label-md text-on-surface font-bold">{owner.name || "Unknown"}</p>
                <p className="text-xs text-on-surface-variant">{owner.email || ""}</p>
              </div>
            </div>
            <div className="space-y-2 text-body-md text-sm">
              <div className="flex justify-between py-1.5 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Verified</span>
                <StatusBadge status={owner.is_verified ? "verified" : "unverified"} />
              </div>
            </div>
            {property.owner_id && (
              <Link
                to={`/admin/users/${property.owner_id}`}
                className="mt-4 block text-center text-primary font-label-md text-label-md hover:underline"
              >
                View Owner Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetails;
