import React, { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useApplications } from "@shared/hooks/useApplications";
import { useProperties } from "@shared/hooks/useProperties";
import { useMessages } from "@shared/hooks/useMessages";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const OwnerApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, users } = useContext(AuthContext);
  const { applications, updateApplicationStatus } = useApplications();
  const { properties } = useProperties();
  const { getOrCreateThread } = useMessages();
  const [internalNote, setInternalNote] = useState("");

  const application = applications.find((a) => a.id === id && a.ownerId === currentUser?.id);
  const property = properties.find((p) => p.id === application?.propertyId);
  const tenant = users.find((u) => u.id === application?.tenantId);

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">
          Application Not Found
        </h3>
        <Link to="/user/my-properties/applications" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Applicants
        </Link>
      </div>
    );
  }

  const handleAccept = () => {
    updateApplicationStatus(application.id, "approved", currentUser.name);
    navigate("/user/my-properties/applications");
  };

  const handleReject = () => {
    updateApplicationStatus(application.id, "rejected", currentUser.name);
    navigate("/user/my-properties/applications");
  };

  const handleChat = () => {
    const threadId = getOrCreateThread(application.tenantId);
    navigate(`/user/messages?thread=${threadId}`);
  };

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
            <Button variant="danger" onClick={handleReject} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">close</span>
              Reject
            </Button>
            <Button variant="secondary" onClick={handleAccept} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check</span>
              Accept
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
        <div className="lg:col-span-8 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden p-6 flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-48 h-48 flex-shrink-0">
              <Avatar src={tenant?.avatar} name={tenant?.name} size="xl" className="w-full h-full rounded-lg" />
              {tenant?.isVerified && (
                <div className="absolute top-2 left-2 bg-secondary text-on-secondary text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center flex-1">
              <div className="flex justify-between items-start mb-2 gap-3">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                    {tenant?.name || "Unknown Applicant"}
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    {tenant?.university || "Student Applicant"}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mt-4 mb-1">
                Applying for
              </p>
              <p className="font-body-md text-body-md text-on-surface font-medium">
                {property?.title || "Unknown Property"}
              </p>
              <p className="text-xs text-outline mt-2">
                Submitted {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2">
              Personal Statement
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              "{application.message}"
            </p>
          </div>

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
                    {new Date(hist.date).toLocaleString()}
                  </span>
                  <p className="text-body-md text-on-surface-variant mt-1">{hist.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-card-gap">
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
