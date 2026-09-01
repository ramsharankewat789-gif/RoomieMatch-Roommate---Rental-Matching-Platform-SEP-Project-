/**
 * OwnerVerification.jsx — User identity verification for property owners.
 * Separate from profile image. Only admin approval changes verified status.
 * API-only — no localStorage fallbacks.
 */
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import { apiUploadVerificationDoc, apiGetVerificationStatus } from "@shared/services/api";

const ALLOWED_TYPES = ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"];
const ALLOWED_EXTS  = [".jpg",".jpeg",".png",".webp",".pdf"];
const MAX_SIZE_MB   = 10;

export const OwnerVerification = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);

  const [docType,        setDocType]        = useState("Government ID");
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [fileError,      setFileError]      = useState("");
  const [loading,        setLoading]        = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [status,         setStatus]         = useState(null);
  const [fetchError,     setFetchError]     = useState("");

  // Load real status from API on mount
  useEffect(() => {
    if (!currentUser) return;
    setFetchingStatus(true);
    apiGetVerificationStatus()
      .then(data  => setStatus(data))
      .catch(err  => setFetchError(err.message || "Could not load verification status."))
      .finally(() => setFetchingStatus(false));
  }, [currentUser?.id]);

  const handleFileChange = (e) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) || !ALLOWED_EXTS.includes(ext)) {
      setFileError("Please upload a JPG, PNG, WEBP, or PDF document.");
      e.target.value = ""; return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`Document size exceeds ${MAX_SIZE_MB} MB.`);
      e.target.value = ""; return;
    }
    setSelectedFile(file);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setFileError("Please select a document."); return; }
    setLoading(true);
    setFileError("");
    try {
      await apiUploadVerificationDoc(selectedFile, docType);
      // Re-fetch status from API to reflect the real state
      const updated = await apiGetVerificationStatus();
      setStatus(updated);
      // Sync AuthContext badge only — no localStorage
      updateProfile({
        verificationDoc: { status: "PENDING", type: docType, submittedAt: new Date().toISOString() }
      });
      setSelectedFile(null);
    } catch (err) {
      setFileError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const docOptions = [
    { value: "Government ID",    label: "Government-Issued ID" },
    { value: "Property Deed",    label: "Property Deed / Ownership Document" },
    { value: "Letting License",  label: "Residential Letting License" },
  ];

  const normalizedStatus = status?.status?.toUpperCase();

  return (
    <div className="max-w-xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-3">
          <span className="material-symbols-outlined text-3xl font-bold">verified_user</span>
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Identity Verification</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Verify your identity to list properties and receive rental applications.
        </p>
        <p className="text-xs text-outline mt-2 italic">
          Identity check — separate from your profile photo.
        </p>
      </div>

      {/* Loading */}
      {fetchingStatus && (
        <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant mb-6">
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Checking verification status...
        </div>
      )}

      {/* Fetch error */}
      {fetchError && !fetchingStatus && (
        <div className="bg-error-container/20 border border-error/30 rounded-lg p-4 text-center text-sm text-error font-semibold mb-4">
          {fetchError}
        </div>
      )}

      {!fetchingStatus && !fetchError && (
        <>
          {/* APPROVED */}
          {normalizedStatus === "APPROVED" && (
            <div className="bg-secondary-container/10 border border-secondary/30 rounded-xl p-6 text-center space-y-3">
              <span className="material-symbols-outlined text-[48px] text-secondary icon-fill">verified</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Identity Verified!</h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Your identity has been confirmed. Your listings carry a verified badge.
              </p>
              <div className="pt-2 text-xs text-outline space-y-0.5">
                <p>Document type: <strong>{status?.document_type || "—"}</strong></p>
                {status?.reviewed_at && (
                  <p>Approved on: <strong>{new Date(status.reviewed_at).toLocaleDateString()}</strong></p>
                )}
              </div>
            </div>
          )}

          {/* PENDING */}
          {normalizedStatus === "PENDING" && (
            <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6 text-center space-y-3">
              <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">hourglass_empty</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Under Review</h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Your document was submitted on{" "}
                <strong>
                  {status?.submitted_at ? new Date(status.submitted_at).toLocaleDateString() : "—"}
                </strong>{" "}
                and is being reviewed by an administrator.
              </p>
              <p className="text-xs text-outline">Verification typically takes 12–24 hours.</p>
            </div>
          )}

          {/* REJECTED — allow resubmission */}
          {normalizedStatus === "REJECTED" && (
            <div className="space-y-4">
              <div className="bg-error-container/10 border border-error/30 rounded-xl p-5 text-center space-y-2">
                <span className="material-symbols-outlined text-[40px] text-error">cancel</span>
                <h3 className="font-headline-sm text-on-surface font-bold">Verification Rejected</h3>
                {status?.rejection_reason && (
                  <p className="text-sm text-on-surface-variant">
                    Reason: <strong>{status.rejection_reason}</strong>
                  </p>
                )}
                <p className="text-xs text-outline">Please resubmit with a valid, clear document.</p>
              </div>
              <UploadForm
                docType={docType} setDocType={setDocType} docOptions={docOptions}
                selectedFile={selectedFile} fileError={fileError}
                onFileChange={handleFileChange} onClear={() => setSelectedFile(null)}
                onSubmit={handleSubmit} loading={loading} btnLabel="Resubmit Verification"
              />
            </div>
          )}

          {/* NOT SUBMITTED */}
          {(!normalizedStatus || normalizedStatus === "NOT_SUBMITTED") && (
            <UploadForm
              docType={docType} setDocType={setDocType} docOptions={docOptions}
              selectedFile={selectedFile} fileError={fileError}
              onFileChange={handleFileChange} onClear={() => setSelectedFile(null)}
              onSubmit={handleSubmit} loading={loading} btnLabel="Submit Verification"
            />
          )}
        </>
      )}
    </div>
  );
};

function UploadForm({ docType, setDocType, docOptions, selectedFile, fileError, onFileChange, onClear, onSubmit, loading, btnLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Select
        label="Verification Document Type"
        value={docType}
        onChange={e => setDocType(e.target.value)}
        options={docOptions}
      />
      <div className="space-y-2">
        <label className="block font-label-md text-label-md text-on-surface">Upload Document</label>
        <div className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors relative group">
          <input
            type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-primary transition-colors mb-2">
            upload_file
          </span>
          <p className="font-label-md text-label-md text-on-surface font-bold">
            {selectedFile ? selectedFile.name : "Drag & Drop or Click to Upload"}
          </p>
          <p className="text-xs text-outline mt-1">PDF, JPG, PNG, WEBP · Max 10 MB</p>
        </div>
        {selectedFile && (
          <button type="button" onClick={onClear} className="text-xs text-error font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">close</span>
            Remove file
          </button>
        )}
        {fileError && (
          <p className="text-xs text-error font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {fileError}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !selectedFile}>
        {loading
          ? <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Submitting...</span>
          : btnLabel}
      </Button>
    </form>
  );
}

export default OwnerVerification;
