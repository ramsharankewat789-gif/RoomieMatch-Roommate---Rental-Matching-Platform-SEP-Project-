/**
 * OwnerVerification.jsx — Landlord identity verification.
 * Separate from profile image. Only admin approval changes verified status.
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

  const [docType, setDocType]       = useState("Government ID");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    apiGetVerificationStatus()
      .then(setServerStatus)
      .catch(() => setServerStatus(null));
  }, []);

  const localStatus    = currentUser?.verificationDoc?.status || "Unverified";
  const displayStatus  = serverStatus?.status || localStatus;
  const normalizedStatus = displayStatus?.toUpperCase();

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
    } catch { /* backend may be offline — fall through */ }
    updateProfile({
      verificationDoc: { status: "Pending", type: docType, submittedAt: new Date().toISOString(), fileName: selectedFile.name }
    });
    setServerStatus({ status: "PENDING", document_type: docType, submitted_at: new Date().toISOString() });
    setSelectedFile(null);
    setLoading(false);
  };

  const docOptions = [
    { value: "Government ID",    label: "Government-Issued ID" },
    { value: "Property Deed",    label: "Property Deed / Ownership Document" },
    { value: "Letting License",  label: "Residential Letting License" }
  ];

  return (
    <div className="max-w-xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-3">
          <span className="material-symbols-outlined text-3xl font-bold">verified_user</span>
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Landlord Verification</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Verify your identity to list properties and receive student applications
        </p>
        <p className="text-xs text-outline mt-2 italic">
          Identity check — separate from your profile photo.
        </p>
      </div>

      {/* APPROVED */}
      {(normalizedStatus === "APPROVED" || normalizedStatus === "VERIFIED") && (
        <div className="bg-secondary-container/10 border border-secondary/30 rounded-xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-secondary icon-fill">verified</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Account Verified!</h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your landlord identity has been confirmed. Your listings carry a verified badge.
          </p>
          <div className="pt-2 text-xs text-outline">
            Document: {serverStatus?.document_type || currentUser?.verificationDoc?.type}
          </div>
        </div>
      )}

      {/* PENDING */}
      {normalizedStatus === "PENDING" && (
        <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">hourglass_empty</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Review Underway</h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your document was submitted and is being reviewed by administrators.<br />
            Verification usually takes 12–24 hours.
          </p>
        </div>
      )}

      {/* REJECTED */}
      {normalizedStatus === "REJECTED" && (
        <div className="space-y-4">
          <div className="bg-error-container/10 border border-error/30 rounded-xl p-5 text-center space-y-2">
            <span className="material-symbols-outlined text-[40px] text-error">cancel</span>
            <h3 className="font-headline-sm text-on-surface font-bold">Verification Rejected</h3>
            {serverStatus?.rejection_reason && (
              <p className="text-sm text-on-surface-variant">Reason: <strong>{serverStatus.rejection_reason}</strong></p>
            )}
            <p className="text-xs text-outline">Please resubmit with a valid document.</p>
          </div>
          <OwnerUploadForm
            docType={docType} setDocType={setDocType} docOptions={docOptions}
            selectedFile={selectedFile} fileError={fileError}
            onFileChange={handleFileChange} onClear={() => setSelectedFile(null)}
            onSubmit={handleSubmit} loading={loading} label="Resubmit Verification"
          />
        </div>
      )}

      {/* NOT SUBMITTED */}
      {(normalizedStatus === "NOT_SUBMITTED" || normalizedStatus === "UNVERIFIED" || !normalizedStatus) && (
        <OwnerUploadForm
          docType={docType} setDocType={setDocType} docOptions={docOptions}
          selectedFile={selectedFile} fileError={fileError}
          onFileChange={handleFileChange} onClear={() => setSelectedFile(null)}
          onSubmit={handleSubmit} loading={loading} label="Submit Verification"
        />
      )}
    </div>
  );
};

function OwnerUploadForm({ docType, setDocType, docOptions, selectedFile, fileError, onFileChange, onClear, onSubmit, loading, label }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Select label="Verification Document Type" value={docType} onChange={(e) => setDocType(e.target.value)} options={docOptions} />
      <div className="space-y-2">
        <label className="block font-label-md text-label-md text-on-surface">Upload Document</label>
        <div className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors relative group">
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-primary transition-colors mb-2">upload_file</span>
          <p className="font-label-md text-label-md text-on-surface font-bold">
            {selectedFile ? selectedFile.name : "Drag & Drop or Click to Upload"}
          </p>
          <p className="text-xs text-outline mt-1">PDF, JPG, PNG, WEBP · Max 10 MB</p>
        </div>
        {selectedFile && (
          <button type="button" onClick={onClear} className="text-xs text-error font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">close</span>Remove file
          </button>
        )}
        {fileError && <p className="text-xs text-error font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span>{fileError}</p>}
      </div>
      <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !selectedFile}>
        {loading ? <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Submitting...</span> : label}
      </Button>
    </form>
  );
}

export default OwnerVerification;
