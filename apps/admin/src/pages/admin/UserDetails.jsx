/**
 * UserDetails.jsx (Admin)
 *
 * Loads user profile from GET /api/users/:id (real API).
 * Approve verification via POST /api/verification/:userId/approve.
 * Reject verification via POST /api/verification/:userId/reject.
 * Delete user via DELETE /api/users/:id.
 * No AuthContext.users dependency. No mock data.
 */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  apiGetUser,
  apiApproveVerification,
  apiRejectVerification,
  apiDeleteUser,
  apiVerificationDocUrl,
} from "@shared/services/api";
import Avatar from "@shared/components/common/Avatar";
import Button from "@shared/components/common/Button";
import StatusBadge from "@shared/components/common/StatusBadge";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const UserDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [pageError,     setPageError]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal,   setRejectModal]   = useState(false);
  const [rejectReason,  setRejectReason]  = useState("");

  useEffect(() => {
    apiGetUser(id)
      .then(data => setUser(data.user))
      .catch(err => setPageError(err.message || "User not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await apiApproveVerification(id);
      setUser(prev => ({ ...prev, is_verified: 1 }));
      alert("User identity verified successfully.");
      navigate("/admin/users");
    } catch (err) {
      alert(err.message || "Failed to approve verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await apiRejectVerification(id, rejectReason.trim() || "Document could not be verified.");
      setRejectModal(false);
      alert("Verification rejected. The user has been notified.");
      navigate("/admin/users");
    } catch (err) {
      alert(err.message || "Failed to reject verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user?.name}? This removes all their data.`)) return;
    try {
      await apiDeleteUser(id);
      navigate("/admin/users");
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading user...
      </div>
    );
  }

  if (pageError || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl p-8">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">User Not Found</h3>
        <p className="text-body-md text-on-surface-variant mt-2">{pageError}</p>
        <Link to="/admin/users" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to User Registry
        </Link>
      </div>
    );
  }

  const verified = user.is_verified === 1 || user.is_verified === true;
  const verifDoc = user.verificationDoc || {};
  const budgetDisplay = user.budget_min && user.budget_max
    ? `$${user.budget_min} – $${user.budget_max}/mo`
    : "Not specified";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/admin/users"
        className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1 w-fit"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to User Registry
      </Link>

      {/* ── Profile Header ────────────────────────────────────────────── */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={user.profile_image || user.avatar} name={user.name} size="xxl" />

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{user.name}</h1>
                {verified && (
                  <span className="text-secondary" title="Verified">
                    <span className="material-symbols-outlined text-[20px] icon-fill">verified</span>
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {user.email} &bull; Role: <span className="capitalize font-semibold text-on-surface">{user.role}</span>
              </p>
              <p className="text-xs text-outline mt-1">ID: {user.id}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {!verified && verifDoc.status !== "NOT_SUBMITTED" && (
                <>
                  <Button variant="outline" onClick={() => setRejectModal(true)} disabled={actionLoading} className="px-4 py-2 text-sm">
                    Reject Docs
                  </Button>
                  <Button variant="primary" onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 text-sm">
                    {actionLoading ? "Processing..." : "Verify User"}
                  </Button>
                </>
              )}
              {user.role !== "admin" && (
                <Button variant="danger" onClick={handleDelete} className="px-4 py-2 text-sm">
                  Delete User
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold">
            {user.university && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                <span>{user.university}</span>
              </div>
            )}
            {user.major && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                <span>{user.major}</span>
              </div>
            )}
            {user.city && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                <span>{user.city}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">phone</span>
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Profile Details ────────────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b border-outline-variant/60 pb-3">
            Profile Details
          </h2>
          <div className="space-y-3 text-body-md">
            {[
              { label: "Age",          value: user.age ? `${user.age} years old` : "—" },
              { label: "Gender",       value: user.gender  || "—" },
              { label: "Budget",       value: budgetDisplay },
              { label: "Verified",     value: verified ? "Identity Verified" : "Not Verified" },
              { label: "Email Status", value: user.email_verified ? "Confirmed" : "Not Confirmed" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-outline-variant/40 last:border-0">
                <span className="text-on-surface-variant font-semibold">{label}</span>
                <span className="text-on-surface font-bold">{value}</span>
              </div>
            ))}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-3 pt-3 border-t border-outline-variant/40">
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mb-1">Bio</p>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Hobbies */}
          {user.hobbies?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-outline-variant/40">
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mb-2">Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {user.hobbies.map(h => (
                  <span key={h} className="text-xs bg-surface-container px-2.5 py-1 rounded-full text-on-surface border border-outline-variant/60">{h}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Verification Document ──────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/60">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Verification Document</h2>
            <StatusBadge status={
              verified ? "verified"
              : verifDoc.status === "PENDING"  ? "pending"
              : verifDoc.status === "REJECTED" ? "rejected"
              : "unverified"
            } />
          </div>

          {verifDoc.status && verifDoc.status !== "NOT_SUBMITTED" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-outline font-semibold uppercase">Document Type</p>
                  <p className="text-on-surface font-bold mt-1">{verifDoc.document_type || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-outline font-semibold uppercase">Submitted</p>
                  <p className="text-on-surface font-bold mt-1">
                    {verifDoc.submitted_at ? new Date(verifDoc.submitted_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center">
                <span className="material-symbols-outlined text-[32px] text-primary mb-2 block">description</span>
                <p className="text-xs text-outline font-semibold mb-1">Submitted Document</p>
                <a
                  href={apiVerificationDocUrl(id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold underline text-sm hover:text-surface-tint"
                >
                  View Document Securely ↗
                </a>
                <p className="text-[10px] text-outline mt-1">Admin session required to view</p>
              </div>

              {verifDoc.rejection_reason && (
                <div className="p-3 bg-error-container/10 border border-error/30 rounded-lg">
                  <p className="text-xs text-error font-bold uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-body-md text-on-surface-variant">{verifDoc.rejection_reason}</p>
                </div>
              )}

              {!verified && verifDoc.status !== "REJECTED" && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setRejectModal(true)} disabled={actionLoading} className="flex-1 text-sm">
                    Reject
                  </Button>
                  <Button variant="primary" onClick={handleApprove} disabled={actionLoading} className="flex-1 text-sm">
                    {actionLoading ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-outline mb-3 block">upload_file</span>
              <p className="text-body-md text-on-surface-variant">No document submitted yet.</p>
            </div>
          )}
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
            Rejecting verification for <strong>{user.name}</strong>.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Document is blurry. Please resubmit a clear photo of your ID."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserDetails;
