/**
 * OwnerApplicationDetails.jsx
 *
 * Loads full application from GET /api/applications/:id.
 * Tenant info comes from application.tenant (returned by API).
 * All field names use snake_case. getOrCreateThread is awaited.
 */
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useMessages } from "@shared/hooks/useMessages";
import { apiGetApplication, apiUpdateApplicationStatus } from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const OwnerApplicationDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { getOrCreateThread } = useMessages();

  const [application,    setApplication]    = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [pageError,      setPageError]      = useState("");
  const [internalNote,   setInternalNote]   = useState("");
  const [actionLoading,  setActionLoading]  = useState(false);

  useEffect(() => {
    apiGetApplication(id)
      .then(data => {
        const a = data.application;
        if (a.owner_id !== currentUser?.id) {
          setPageError("Access denied.");
          return;
        }
        setApplication(a);
      })
      .catch(err => setPageError(err.message || "Application not found."))
      .finally(() => setLoading(false));
  }, [id, currentUser?.id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await apiUpdateApplicationStatus(application.id, "approved");
      navigate("/user/my-properties/applications");
    } catch (err) {
      alert(err.message || "Failed to approve.");
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await apiUpdateApplicationStatus(application.id, "rejected");
      navigate("/user/my-properties/applications");
    } catch (err) {
      alert(err.message || "Failed to reject.");
      setActionLoading(false);
    }
  };

  const handleChat = async () => {
    const threadId = await getOrCreateThread(application.tenant_id, application.property_id);
    if (threadId) navigate(`/user/messages?thread=${threadId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading application...
      </div>
    );
  }

  if (pageError || !application) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl p-8">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">
          Application Not Found
        </h3>
        <p className="text-body-md text-on-surface-variant mt-2">{pageError}</p>
        <Link to="/user/my-properties/applications" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Applicants
        </Link>
      </div>
    );
  }

  // Tenant info from API response
  const tenant  = application.tenant  || {};
  const tenantName   = application.tenant_name  || tenant.name  || "Applicant";
  const tenantImage  = application.tenant_image || tenant.profile_image || null;
  const tenantVerified = tenant.is_verified === 1 || tenant.is_verified === true;

  return (
    <div className="space-y-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
        <Link
          to="/user/my-properties/applications"
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Applicants
        </Link>
        {application.status === "pending" && (
          <div className="flex gap-4">
            <Button variant="danger" onClick={handleReject} disabled={actionLoading} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">close</span>
              {actionLoading ? "..." : "Reject"}
            </Button>
            <Button variant="secondary" onClick={handleAccept} disabled={actionLoading} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check</span>
              {actionLoading ? "..." : "Accept"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Applicant Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden p-6 flex flex-col md:flex-row gap-6">
            <div className="relative w-24 h-24 md:w-36 md:h-36 flex-shrink-0">
              <Avatar src={tenantImage} name={tenantName} size="xl" className="w-full h-full rounded-xl" />
              {tenantVerified && (
                <div className="absolute top-1 left-1 bg-secondary text-on-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]">verified</span>
                  Verified
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center flex-1">
              <div className="flex justify-between items-start mb-2 gap-3">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">{tenantName}</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    {tenant.university || "Student Applicant"}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mt-3 mb-1">
                Applying for
              </p>
              <p className="font-body-md text-body-md text-on-surface font-medium">
                {application.property_title || "Property"}
              </p>
              <p className="text-xs text-outline mt-1">
                Submitted {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {/* Personal Statement */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2">
              Personal Statement
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed italic">
              "{application.message || "No message provided."}"
            </p>
          </div>

          {/* Application History from DB */}
          {application.history?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant pb-2">
                Application History
              </h2>
              <div className="relative border-l-2 border-outline-variant ml-4 pl-6 space-y-6">
                {application.history.map((hist, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest" />
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase block">
                      {hist.status}
                    </span>
                    <span className="text-xs text-outline block mt-0.5">
                      {hist.changed_at ? new Date(hist.changed_at).toLocaleString() : "—"}
                    </span>
                    <p className="text-body-md text-on-surface-variant mt-1">{hist.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5">
            <h3 className="font-label-md text-label-md text-on-surface mb-4">Quick Actions</h3>
            <Button onClick={handleChat} className="w-full flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Message Applicant
            </Button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-outline">edit_note</span>
                Internal Notes
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-outline bg-surface-container px-2 py-0.5 rounded">
                Private
              </span>
            </div>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline resize-none h-24"
              placeholder="Add notes about this applicant..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerApplicationDetails;
