import React, { useContext } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const VerificationManagement = () => {
  const { users, setUsers } = useContext(AuthContext);
  const { properties, setProperties } = useProperties();

  // Filter pending verifications
  const pendingUsers = users.filter((u) => u.verificationDoc && u.verificationDoc.status === "Pending");
  const pendingProps = properties.filter((p) => !p.isVerified);

  const handleApproveUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            isVerified: true,
            verificationDoc: { ...u.verificationDoc, status: "Verified" }
          };
        }
        return u;
      })
    );
    alert("User account verified successfully!");
  };

  const handleRejectUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            isVerified: false,
            verificationDoc: { ...u.verificationDoc, status: "Rejected" }
          };
        }
        return u;
      })
    );
    alert("User verification documentation rejected.");
  };

  const handleApproveProp = (propId) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propId) {
          return { ...p, isVerified: true };
        }
        return p;
      })
    );
    alert("Property listing verified successfully!");
  };

  const handleRejectProp = (propId) => {
    if (window.confirm("Reject and remove this property listing?")) {
      setProperties((prev) => prev.filter((p) => p.id !== propId));
      alert("Property listing removed from registry.");
    }
  };

  const getOwnerName = (ownerId) => {
    return users.find((u) => u.id === ownerId)?.name || "Landlord";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Verifications Queue</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Approve university credentials and landlord listings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Profiles Queue */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/60 pb-3">
            Profile Verifications ({pendingUsers.length})
          </h2>

          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <p className="text-body-md text-on-surface-variant py-8 text-center">
                No user profiles pending review.
              </p>
            ) : (
              pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-bold">
                        {user.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        Role: <span className="capitalize">{user.role}</span> &bull; ID: {user.id.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5 font-medium text-on-surface-variant">
                    <div>
                      <span className="text-outline font-semibold uppercase tracking-wider block">Document Type</span>
                      <span className="text-on-surface font-bold">{user.verificationDoc.type}</span>
                    </div>
                    <div>
                      <span className="text-outline font-semibold uppercase tracking-wider block">Uploaded File</span>
                      <span className="text-on-surface font-bold">{user.verificationDoc.fileName || "id_card.png"}</span>
                    </div>
                    <div>
                      <span className="text-outline font-semibold uppercase tracking-wider block">Submission Date</span>
                      <span className="text-on-surface font-bold">
                        {new Date(user.verificationDoc.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleRejectUser(user.id)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleApproveUser(user.id)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Properties Queue */}
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
                <div
                  key={prop.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-16 h-12 object-cover rounded-lg border border-outline-variant/60 bg-surface-container shrink-0"
                    />
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-bold truncate max-w-xs">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        Owner: {getOwnerName(prop.ownerId)} &bull; Price: ${prop.price}/mo
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1 font-medium text-on-surface-variant">
                    <div>
                      <span className="text-outline font-semibold uppercase tracking-wider block">Address</span>
                      <span className="text-on-surface font-bold">{prop.address}, {prop.city}</span>
                    </div>
                    <div>
                      <span className="text-outline font-semibold uppercase tracking-wider block">Specifications</span>
                      <span className="text-on-surface font-bold">
                        {prop.bedrooms} Bed, {prop.bathrooms} Bath &bull; {prop.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleRejectProp(prop.id)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Reject Listing
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleApproveProp(prop.id)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Verify listing
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default VerificationManagement;
