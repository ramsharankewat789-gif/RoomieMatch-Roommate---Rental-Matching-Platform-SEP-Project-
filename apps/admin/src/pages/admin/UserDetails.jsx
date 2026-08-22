import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Avatar from "@shared/components/common/Avatar";
import Button from "@shared/components/common/Button";
import StatusBadge from "@shared/components/common/StatusBadge";

export const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, setUsers } = useContext(AuthContext);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">User Not Found</h3>
        <p className="text-body-md text-on-surface-variant mt-2">The user you are trying to audit does not exist.</p>
        <Link to="/admin/users" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to User Registry
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            isVerified: true,
            verificationDoc: { ...u.verificationDoc, status: "Verified" }
          };
        }
        return u;
      })
    );
    alert("User status set to Verified.");
    navigate("/admin/users");
  };

  const handleReject = () => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            isVerified: false,
            verificationDoc: { ...u.verificationDoc, status: "Rejected" }
          };
        }
        return u;
      })
    );
    alert("User status set to Rejected.");
    navigate("/admin/users");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/users"
          className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1 w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Users List
        </Link>
      </div>

      {/* User Header Profile */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={user.avatar} name={user.name} size="xxl" />
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                {user.name}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Account ID: {user.id.toUpperCase()} &bull; Role: <span className="capitalize font-semibold">{user.role}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReject} className="px-4 py-2">
                Reject Docs
              </Button>
              <Button variant="primary" onClick={handleApprove} className="px-4 py-2">
                Verify User
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold">
            {user.role === "tenant" ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                  <span>{user.university}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                  <span>{user.major}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
                <span>{user.company || "Independent landlord"}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">phone</span>
              <span>{user.phone || "No phone listed"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Docs section */}
      {user.verificationDoc && (
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/60">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Verification Document</h2>
            <StatusBadge status={user.verificationDoc.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-md text-on-surface-variant font-medium">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-outline font-semibold">DOCUMENT TYPE</span>
              <span className="text-on-surface font-bold">{user.verificationDoc.type}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-outline font-semibold">SUBMITTED DATE</span>
              <span className="text-on-surface font-bold">
                {user.verificationDoc.submittedAt ? new Date(user.verificationDoc.submittedAt).toLocaleString() : "No submission date"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-8 border border-dashed border-outline-variant rounded-xl text-center bg-surface-container-low flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">dock</span>
            <p className="font-label-md text-label-md text-on-surface font-bold">
              {user.verificationDoc.fileName || "verification_document_placeholder.pdf"}
            </p>
            <p className="text-xs text-outline mt-1">Uploaded document matches registrar credentials</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default UserDetails;
