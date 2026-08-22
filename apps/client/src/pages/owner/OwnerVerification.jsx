import React, { useState, useContext } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import StatusBadge from "@shared/components/common/StatusBadge";

export const OwnerVerification = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const [docType, setDocType] = useState("Government ID");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName) {
      alert("Please choose a file to upload.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      updateProfile({
        verificationDoc: {
          status: "Pending",
          type: docType,
          submittedAt: new Date().toISOString(),
          fileName: fileName
        }
      });
      setLoading(false);
    }, 1000);
  };

  const docOptions = [
    { value: "Government ID", label: "Government-Issued ID" },
    { value: "Property Deed", label: "Property Deed / Ownership Document" },
    { value: "Letting License", label: "Residential Letting License" }
  ];

  const status = currentUser?.verificationDoc?.status || "Unverified";

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
      </div>

      {status === "Verified" ? (
        <div className="bg-secondary-container/10 border border-secondary/30 rounded-xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-secondary icon-fill">verified</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Account Verified!</h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your landlord identity has been confirmed. Your listings carry a verified badge visible to all students.
          </p>
          <div className="pt-2">
            <span className="text-xs text-outline">
              Verified document: {currentUser.verificationDoc?.type} &bull; Approved on:{" "}
              {new Date(currentUser.verificationDoc?.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ) : status === "Pending" ? (
        <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">hourglass_empty</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Review Underway</h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your document (<strong>{currentUser.verificationDoc?.fileName || "uploaded file"}</strong>) was submitted
            on {new Date(currentUser.verificationDoc?.submittedAt).toLocaleDateString()} and is being reviewed by
            administrators.
          </p>
          <div className="pt-2">
            <span className="text-xs text-outline">Verification usually takes between 12 to 24 hours.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Verification Document Type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            options={docOptions}
          />

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface">
              Upload Document Image
            </label>
            <div className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors relative group">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-primary transition-colors mb-2">
                cloud_upload
              </span>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                {fileName ? fileName : "Drag & Drop or Click to Upload"}
              </p>
              <p className="text-xs text-outline mt-1">Supports PDF, JPG, or PNG up to 5MB</p>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading || !fileName}
          >
            {loading ? "Submitting..." : "Submit Verification"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default OwnerVerification;
