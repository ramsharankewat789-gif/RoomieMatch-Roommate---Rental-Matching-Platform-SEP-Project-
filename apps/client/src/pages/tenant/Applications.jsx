import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useApplications } from "@shared/hooks/useApplications";
import { useProperties } from "@shared/hooks/useProperties";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import EmptyState from "@shared/components/common/EmptyState";
import Modal from "@shared/components/common/Modal";

export const Applications = () => {
  const { currentUser } = useContext(AuthContext);
  const { applications, cancelApplication } = useApplications();
  const { properties } = useProperties();

  const [selectedApp, setSelectedApp] = useState(null);

  const userApps = applications.filter((a) => a.tenantId === currentUser?.id);

  const getPropertyDetails = (propId) => {
    return properties.find((p) => p.id === propId);
  };

  const handleCancel = (appId) => {
    if (window.confirm("Are you sure you want to cancel this application?")) {
      cancelApplication(appId, currentUser.name);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">My Applications</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Track the status of your housing applications and landlord responses
        </p>
      </div>

      {userApps.length === 0 ? (
        <EmptyState
          icon="description"
          title="No applications submitted"
          description="Browse available properties near campus and submit an application to start the leasing process."
          actionText="Search Rentals"
          onActionClick={() => {
            window.location.href = "/user/properties";
          }}
        />
      ) : (
        <div className="space-y-4">
          {userApps.map((app) => {
            const prop = getPropertyDetails(app.propertyId);
            return (
              <div
                key={app.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Property Detail */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {prop?.title || "Unknown Property"}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-body-md text-on-surface-variant font-medium">
                    {prop?.address}, {prop?.city}
                  </p>
                  <p className="text-xs text-outline">
                    Submitted on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <p className="text-body-md text-on-surface-variant line-clamp-2 italic pt-2 pl-3 border-l-2 border-outline-variant">
                    "{app.message}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      ${prop?.price || 0}
                    </span>
                    <span className="text-xs text-outline font-medium">/month</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/tenant/applications/${app.id}`}>
                      <Button variant="outline" className="px-4 py-2">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedApp(app)}
                      className="px-4 py-2"
                    >
                      View Timeline
                    </Button>
                    
                    {app.status === "pending" && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(app.id)}
                        className="px-4 py-2"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Status History"
      >
        {selectedApp && (
          <div className="space-y-6 py-2">
            <p className="text-body-md text-on-surface-variant">
              Application for <strong>{getPropertyDetails(selectedApp.propertyId)?.title}</strong>
            </p>
            
            {/* Timeline */}
            <div className="relative border-l-2 border-outline-variant ml-4 pl-6 space-y-6">
              {selectedApp.history.map((hist, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
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

export default Applications;
