/**
 * VerificationManagement.jsx (Admin)
 *
 * Reads pending verifications from GET /api/verification/pending.
 * Approve via POST /api/verification/:userId/approve.
 * Reject  via POST /api/verification/:userId/reject (with reason).
 *
 * Verification docs served through auth-gated GET /api/verification/doc/:userId.
 * No mock data. No localStorage.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  apiListPendingVerifications,
  apiApproveVerification,
  apiRejectVerification,
  apiVerificationDocUrl,
  apiListProperties,
  apiVerifyProperty,
  apiDeleteProperty,
} from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const VerificationManagement = () => {
  // ── User verifications ────────────────────────────────────────────────────
  const [verifications, setVerifications] = useState([]);
  const [verifLoading, setVerifLoading]   = useState(true);
  const [verifError, setVerifError]       = useState("");

  // ── Property verifications ─────────────────────────────────────────────
  const [pendingProps, setPendingProps]   = useState([]);
  const [propsLoading, setPropsLoading]   = useState(true);

  // ── Rejection modal ───────────────────────────────────────────────────────
  const [rejectModal, setRejectModal]         = useState(false);
  const [rejectTarget, setRejectTarget]       = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading]     = useState(false);

  // ── Load pending user verifications ───────────────────────────────────
  const loadVerifications = useCallback(async () => {
    setVerifLoading(true);
    setVerifError("");
    try {
      const data = await apiListPendingVerifications();
      setVerifications(data.verifications || []);
    } catch (err) {
      setVerifError(err.message || "Failed to load verifications.");
    } finally {
      setVerifLoading(false);
    }
  }, []);

  // ── Load unverified properties ────────────────────────────────────────
  const loadPendingProps = useCallback(async () => {
    setPropsLoading(true);
    try {
      const data = await apiListProperties({ verified: "false", limit: 50 });
      setPendingProps(data.properties || []);
    } catch {
      setPendingProps([]);
    } finally {
      setPropsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications();
    loadPendingProps();
  }, [loadVerifications, loadPendingProps]);

  // ── Approve user verification ────────────────────────────────────────
  const handleApprove = async (userId, name) => {
    setActionLoading(true);
    try {
      await apiApproveVerification(userId);
      setVerifications(prev => prev.filter(v => v.user_id !== userId));
    } catch (err) {
      alert(err.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Open reject modal ────────────────────────────────────────────────
  const openRejectModal = (userId, name) => {
    setRejectTarget({ userId, name });
    setRejectionReason("");
    setRejectModal(true);
  };

  // ── Confirm rejection ────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await apiRejectVerification(
        rejectTarget.userId,
        rejectionReason.trim() || "Document could not be verified. Please resubmit."
      );
      setVerifications(prev => prev.filter(v => v.user_id !== rejectTarget.userId));
      setRejectModal(false);
    } catch (err) {
      alert(err.message || "Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Approve property listing ─────────────────────────────────────────
  const handleVerifyProp = async (propId, title) => {
    try {
      await apiVerifyProperty(propId);
      setPendingProps(prev => prev.filter(p => p.id !== propId));
    } catch (err) {
      alert(err.message || "Failed to verify property.");
    }
  };

  // ── Reject (delete) property listing ────────────────────────────────
  const handleDeleteProp = async (propId, title) => {
    if (!window.confirm(`Remove "${title}" from the platform? This cannot be undone.`)) return;
    try {
      await apiDeleteProperty(propId);
      setPendingProps(prev => prev.filter(p => p.id !== propId));
    } catch (err) {
      alert(err.message || "Failed to delete property.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
          Verifications Queue
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Approve identity credentials and property listings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── User Identity Verifications ───────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/60 pb-3">
            Identity Verifications ({verifications.length})
          </h2>

          {verifLoading && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Loading...
            </div>
          )}
          {verifError && (
            <p className="text-xs text-error font-semibold py-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {verifError}
            </p>
          )}

          <div className="space-y-4">
            {!verifLoading && verifications.length === 0 && (
              <p className="text-body-md text-on-surface-variant py-8 text-center">
                No identity verifications pending review.
              </p>
            )}

            {verifications.map((v) => (
              <div key={v.id} className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar name={v.name} size="sm" />
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">{v.name}</h3>
                    <p className="text-xs text-on-surface-variant font-semibold capitalize">
                      {v.role} · {v.email}
                    </p>
                  </div>
                </div>

                {/* Doc details */}
                <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5 font-medium text-on-surface-variant">
                  <div>
                    <span className="text-outline font-semibold uppercase tracking-wider block">Document Type</span>
                    <span className="text-on-surface font-bold">{v.document_type || "—"}</span>
                  </div>
                  <div>
                    <span className="text-outline font-semibold uppercase tracking-wider block">Submitted</span>
                    <span className="text-on-surface font-bold">
                      {v.submitted_at ? new Date(v.submitted_at).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-outline font-semibold uppercase tracking-wider block">View Document</span>
                    <a
                      href={apiVerificationDocUrl(v.user_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold underline hover:text-surface-tint"
                    >
                      Open Securely ↗
                    </a>
                    <span className="block text-[10px] text-outline mt-0.5">Requires admin session</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => openRejectModal(v.user_id, v.name)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-xs"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(v.user_id, v.name)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-xs"
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Property Verifications ────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/60 pb-3">
            Property Verifications ({pendingProps.length})
          </h2>

          {propsLoading && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Loading...
            </div>
          )}

          <div className="space-y-4">
            {!propsLoading && pendingProps.length === 0 && (
              <p className="text-body-md text-on-surface-variant py-8 text-center">
                No properties pending verification.
              </p>
            )}

            {pendingProps.map((prop) => (
              <div key={prop.id} className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-surface-container-high rounded-lg border border-outline-variant/60 overflow-hidden shrink-0">
                    {(prop.cover_image || prop.images?.[0]) ? (
                      <img
                        src={prop.cover_image || prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-bold truncate max-w-xs">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      {prop.owner_name} · ${prop.price}/mo
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1 font-medium text-on-surface-variant">
                  <div>
                    <span className="text-outline font-semibold uppercase tracking-wider block">Address</span>
                    <span className="text-on-surface font-bold">{prop.address}, {prop.city}</span>
                  </div>
                  <div>
                    <span className="text-outline font-semibold uppercase tracking-wider block">Specs</span>
                    <span className="text-on-surface font-bold">
                      {prop.bedrooms} Bed · {prop.bathrooms} Bath · {prop.type}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteProp(prop.id, prop.title)}
                    className="px-3 py-1.5 text-xs"
                  >
                    Reject Listing
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleVerifyProp(prop.id, prop.title)}
                    className="px-3 py-1.5 text-xs"
                  >
                    Verify Listing
                  </Button>
                </div>
              </div>
            ))}
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
            <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-body-md text-on-surface-variant">
            Rejecting verification for <strong>{rejectTarget?.name}</strong>.
            Provide a reason so they know what to resubmit.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Document is blurry or unreadable. Please upload a clear photo."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VerificationManagement;
