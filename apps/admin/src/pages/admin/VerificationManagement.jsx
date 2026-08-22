/**
 * VerificationManagement.jsx (Admin)
 *
 * Reviews pending user identity verifications and property listings.
 * Admins can: approve, reject (with reason), view submission details.
 * Verification docs are served through auth-gated API endpoint — not public URLs.
 *
 * Role security: this page is inside AdminLayout which requires role === 'admin'.
 * Backend endpoints also enforce requireAdmin middleware.
 */
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";
import {
  apiListPendingVerifications,
  apiApproveVerification,
  apiRejectVerification,
  apiVerificationDocUrl
} from "@shared/services/api";

export const VerificationManagement = () => {
  const { users, setUsers }              = useContext(AuthContext);
  const { properties, setProperties }    = useProperties();

  // Backend verification queue
  const [apiVerifications, setApiVerifications] = useState([]);
  const [apiLoading, setApiLoading]             = useState(false);
  const [apiError, setApiError]                 = useState("");

  // Rejection modal state
  const [rejectModal, setRejectModal]       = useState(false);
  const [rejectTarget, setRejectTarget]     = useState(null);   // { userId, name }
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading]   = useState(false);

  // Fetch real pending verifications from backend
  useEffect(() => {
    const load = async () => {
      setApiLoading(true);
      try {
        const data = await apiListPendingVerifications();
        setApiVerifications(data.verifications || []);
      } catch {
        setApiError("Could not load backend verifications (server may be offline).");
      } finally {
        setApiLoading(false);
      }
    };
    load();
  }, []);

  // ── localStorage-based user verifications (fallback / mock data) ────────
  const pendingLocalUsers = users.filter(
    (u) => u.verificationDoc?.status === "Pending" &&
           !apiVerifications.some((v) => v.user_id === u.id)
  );
  const pendingProps = properties.filter((p) => !p.isVerified);

  // ── API-backed approval ───────────────────────────────────────────────────
  const handleApiApprove = async (userId, userName) => {
    setActionLoading(true);
    try {
      await apiApproveVerification(userId);
      setApiVerifications((prev) => prev.filter((v) => v.user_id !== userId));
      // Sync localStorage user
      syncLocalUserVerification(userId, "Verified", true);
      alert(`${userName} verification approved.`);
    } catch (err) {
      alert(err.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (userId, userName) => {
    setRejectTarget({ userId, userName });
    setRejectionReason("");
    setRejectModal(true);
  };

  const handleApiReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await apiRejectVerification(rejectTarget.userId, rejectionReason || "Document could not be verified.");
      setApiVerifications((prev) => prev.filter((v) => v.user_id !== rejectTarget.userId));
      syncLocalUserVerification(rejectTarget.userId, "Rejected", false);
      setRejectModal(false);
      alert(`${rejectTarget.userName} verification rejected.`);
    } catch (err) {
      alert(err.message || "Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── localStorage fallback approval/rejection ──────────────────────────────
  const handleLocalApprove = (userId) => {
    syncLocalUserVerification(userId, "Verified", true);
    alert("User account verified successfully!");
  };

  const handleLocalReject = (userId) => {
    syncLocalUserVerification(userId, "Rejected", false);
    alert("User verification rejected.");
  };

  const syncLocalUserVerification = (userId, status, isVerified) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isVerified, verificationDoc: { ...u.verificationDoc, status } }
          : u
      )
    );
  };

  const handleApproveProp = (propId) => {
    setProperties((prev) => prev.map((p) => p.id === propId ? { ...p, isVerified: true } : p));
    alert("Property listing verified successfully!");
  };

  const handleRejectProp = (propId) => {
    if (window.confirm("Reject and remove this property listing?")) {
      setProperties((prev) => prev.filter((p) => p.id !== propId));
    }
  };

  const getOwnerName = (ownerId) => users.find((u) => u.id === ownerId)?.name || "Landlord";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Verifications Queue</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Approve identity credentials and property listings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── User Verification Queue ──────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/60 pb-3">
            Identity Verifications ({apiVerifications.length + pendingLocalUsers.length})
          </h2>

          {apiLoading && (
            <p className="text-sm text-on-surface-variant flex items-center gap-2 py-4">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Loading from server...
            </p>
          )}
          {apiError && (
            <p className="text-xs text-error font-semibold flex items-center gap-1 py-2">
              <span className="material-symbols-outlined text-[14px]">warning</span>{apiError}
            </p>
          )}

          <div className="space-y-4">
            {/* API-sourced verifications */}
            {apiVerifications.map((v) => (
              <VerificationCard
                key={v.id}
                name={v.name}
                email={v.email}
                role={v.role}
                docType={v.document_type}
                submittedAt={v.submitted_at}
                docViewUrl={apiVerificationDocUrl(v.user_id)}
                onApprove={() => handleApiApprove(v.user_id, v.name)}
                onReject={() => openRejectModal(v.user_id, v.name)}
                loading={actionLoading}
                source="backend"
              />
            ))}

            {/* localStorage / mock fallback */}
            {pendingLocalUsers.map((user) => (
              <VerificationCard
                key={user.id}
                name={user.name}
                email={user.email}
                role={user.role}
                avatar={user.avatar}
                docType={user.verificationDoc?.type}
                fileName={user.verificationDoc?.fileName}
                submittedAt={user.verificationDoc?.submittedAt}
                onApprove={() => handleLocalApprove(user.id)}
                onReject={() => handleLocalReject(user.id)}
                loading={false}
                source="local"
              />
            ))}

            {apiVerifications.length === 0 && pendingLocalUsers.length === 0 && !apiLoading && (
              <p className="text-body-md text-on-surface-variant py-8 text-center">
                No identity verifications pending review.
              </p>
            )}
          </div>
        </section>

        {/* ── Property Verification Queue ──────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/60 pb-3">
            Property Verifications ({pendingProps.length})
          </h2>
          <div className="space-y-4">
            {pendingProps.length === 0 ? (
              <p className="text-body-md text-on-surface-variant py-8 text-center">
                No properties pending verification.
              </p>
            ) : (
              pendingProps.map((prop) => (
                <div key={prop.id} className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex items-center gap-3">
                    {prop.images?.[0] && (
                      <img src={prop.images[0]} alt={prop.title}
                        className="w-16 h-12 object-cover rounded-lg border border-outline-variant/60 bg-surface-container shrink-0" />
                    )}
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-bold truncate max-w-xs">{prop.title}</h3>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        Owner: {getOwnerName(prop.ownerId)} &bull; ${prop.price}/mo
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1 font-medium text-on-surface-variant">
                    <div><span className="text-outline font-semibold uppercase tracking-wider block">Address</span>
                      <span className="text-on-surface font-bold">{prop.address}, {prop.city}</span></div>
                    <div><span className="text-outline font-semibold uppercase tracking-wider block">Specs</span>
                      <span className="text-on-surface font-bold">{prop.bedrooms} Bed, {prop.bathrooms} Bath &bull; {prop.type}</span></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => handleRejectProp(prop.id)} className="px-3 py-1.5 text-xs">Reject Listing</Button>
                    <Button variant="primary" onClick={() => handleApproveProp(prop.id)} className="px-3 py-1.5 text-xs">Verify Listing</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Verification"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleApiReject} disabled={actionLoading}>
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-body-md text-on-surface-variant">
            You are rejecting the verification submission for <strong>{rejectTarget?.userName}</strong>.
            Please provide a reason so the user knows what to resubmit.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Document is blurry or unreadable. Please upload a clear photo."
            rows={3}
          />
          <p className="text-xs text-outline">
            The user will see this reason and can resubmit with corrected documents.
          </p>
        </div>
      </Modal>
    </div>
  );
};

/** Reusable verification card for both API and local sources */
function VerificationCard({ name, email, role, avatar, docType, fileName, submittedAt, docViewUrl, onApprove, onReject, loading, source }) {
  return (
    <div className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={name} size="sm" />
        <div>
          <h3 className="font-label-md text-label-md text-on-surface font-bold">{name}</h3>
          <p className="text-xs text-on-surface-variant font-semibold capitalize">
            Role: {role} &bull; {email}
          </p>
        </div>
      </div>

      <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5 font-medium text-on-surface-variant">
        <div>
          <span className="text-outline font-semibold uppercase tracking-wider block">Document Type</span>
          <span className="text-on-surface font-bold">{docType || "—"}</span>
        </div>
        {fileName && (
          <div>
            <span className="text-outline font-semibold uppercase tracking-wider block">Uploaded File</span>
            <span className="text-on-surface font-bold">{fileName}</span>
          </div>
        )}
        {docViewUrl && (
          <div>
            <span className="text-outline font-semibold uppercase tracking-wider block">View Document</span>
            <a
              href={docViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold underline hover:text-surface-tint"
            >
              Open Securely ↗
            </a>
            <span className="block text-[10px] text-outline mt-0.5">Requires admin authentication</span>
          </div>
        )}
        {submittedAt && (
          <div>
            <span className="text-outline font-semibold uppercase tracking-wider block">Submitted</span>
            <span className="text-on-surface font-bold">{new Date(submittedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onReject} disabled={loading} className="px-3 py-1.5 text-xs">Reject</Button>
        <Button variant="primary" onClick={onApprove} disabled={loading} className="px-3 py-1.5 text-xs">Approve</Button>
      </div>
    </div>
  );
}

export default VerificationManagement;
