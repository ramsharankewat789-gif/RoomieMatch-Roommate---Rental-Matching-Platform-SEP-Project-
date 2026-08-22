import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useApplications } from "@shared/hooks/useApplications";
import { useProperties } from "@shared/hooks/useProperties";
import { useMessages } from "@shared/hooks/useMessages";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import EmptyState from "@shared/components/common/EmptyState";
import Modal from "@shared/components/common/Modal";

export const OwnerApplications = () => {
  const { currentUser } = useContext(AuthContext);
  const { applications, updateApplicationStatus } = useApplications();
  const { properties } = useProperties();
  const { getOrCreateThread } = useMessages();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTimelineApp, setSelectedTimelineApp] = useState(null);

  const myApps = applications.filter((a) => a.ownerId === currentUser?.id);

  const filteredApps = myApps.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const getPropertyTitle = (propId) => {
    return properties.find((p) => p.id === propId)?.title || "Unknown Property";
  };

  const handleChat = (tenantId) => {
    const threadId = getOrCreateThread(tenantId);
    navigate(`/user/messages?thread=${threadId}`);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Applications Received</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Review background messages and accept or decline student applicants
          </p>
        </div>
        <div className="w-56 shrink-0">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <EmptyState
          icon="description"
          title="No applications found"
          description="No student applications matched your criteria or have been received yet."
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between gap-4 hover:shadow-sm transition-all"
            >
              {/* Application Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-label-md text-label-md text-primary font-bold">
                    Applicant ID: {app.tenantId.toUpperCase()}
                  </h3>
                  <StatusBadge status={app.status} />
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Property: {getPropertyTitle(app.propertyId)}
                </h4>
                <p className="text-xs text-outline font-semibold">
                  Submitted on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/60 italic text-body-md text-on-surface-variant leading-relaxed mt-3">
                  "{app.message}"
                </div>
              </div>

              {/* Actions Box */}
              <div className="flex flex-col justify-between items-end gap-4 shrink-0">
                <Link to={`/user/my-properties/applications/${app.id}`}>
                  <Button variant="outline" className="px-4 py-2 text-xs">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTimelineApp(app)}
                  className="px-4 py-2 text-xs"
                >
                  View Activity Logs
                </Button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChat(app.tenantId)}
                    className="px-4 py-2 border border-outline text-primary font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-1 font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Chat
                  </button>

                  {app.status === "pending" && (
                    <>
                      <Button
                        variant="danger"
                        onClick={() => updateApplicationStatus(app.id, "rejected", currentUser.name)}
                        className="px-4 py-2"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => updateApplicationStatus(app.id, "approved", currentUser.name)}
                        className="px-4 py-2"
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal
        isOpen={!!selectedTimelineApp}
        onClose={() => setSelectedTimelineApp(null)}
        title="Application Log Details"
      >
        {selectedTimelineApp && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-outline font-bold uppercase tracking-wider block">Target Property</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {getPropertyTitle(selectedTimelineApp.propertyId)}
              </span>
            </div>

            <div className="relative border-l-2 border-outline-variant ml-4 pl-6 space-y-6">
              {selectedTimelineApp.history.map((hist, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest"></span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase block">
                      {hist.status}
                    </span>
                    <span className="text-xs text-outline block mt-0.5">
                      {new Date(hist.date).toLocaleString()}
                    </span>
                    <p className="text-body-md text-on-surface-variant mt-1">
                      {hist.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerApplications;
