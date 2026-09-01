/**
 * Applications.jsx (Tenant view)
 *
 * Lists the current user's submitted applications from GET /api/applications.
 * Cancel calls DELETE /api/applications/:id.
 * Uses API field names: tenant_id, property_id, applied_at, property_title,
 * property_address, property_price, history[]{status, label, changed_at}.
 * No mock data, no localStorage.
 */
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useApplications } from "@shared/hooks/useApplications";
import { formatCurrency } from "@shared/utils/currency";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import EmptyState from "@shared/components/common/EmptyState";
import Modal from "@shared/components/common/Modal";

export const Applications = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // useApplications hook now calls real API — returns applications filtered by current user
  const { applications, loading, error, cancelApplication } = useApplications();

  const [selectedApp, setSelectedApp]     = useState(null);
  const [cancelling,  setCancelling]      = useState(null); // appId being cancelled

  // API returns both tenant and owner applications for the current user.
  // Show only ones where the current user is the tenant.
  const myApps = applications.filter(
    a => (a.tenant_id || a.tenantId) === currentUser?.id
  );

  const handleCancel = async (appId) => {
    if (!window.confirm("Cancel this application?")) return;
    setCancelling(appId);
    const result = await cancelApplication(appId);
    setCancelling(null);
    if (!result.success) alert(result.message || "Failed to cancel.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">My Applications</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Track the status of your housing applications
        </p>
      </div>

      {myApps.length === 0 ? (
        <EmptyState
          icon="description"
          title="No applications submitted"
          description="Browse available properties near campus and click Apply Now to start the process."
          actionText="Search Rentals"
          onActionClick={() => navigate("/user/properties")}
        />
      ) : (
        <div className="space-y-4">
          {myApps.map(app => {
            // API returns flattened property fields on the list endpoint
            const propTitle   = app.property_title   || app.property?.title   || "Property";
            const propAddress = app.property_address || app.property?.address || "";
            const propCity    = app.property?.city   || "";
            const propPrice   = app.property_price   || app.property?.price   || 0;
            const propId      = app.property_id      || app.propertyId;
            const appliedDate = app.applied_at       || app.appliedAt;

            return (
              <div
                key={app.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {propTitle}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>
                  {(propAddress || propCity) && (
                    <p className="text-body-md text-on-surface-variant font-medium">
                      {propAddress}{propCity ? `, ${propCity}` : ""}
                    </p>
                  )}
                  <p className="text-xs text-outline">
                    Submitted {appliedDate ? new Date(appliedDate).toLocaleDateString() : "—"}
                  </p>
                  {app.message && (
                    <p className="text-body-md text-on-surface-variant line-clamp-2 italic pt-2 pl-3 border-l-2 border-outline-variant">
                      "{app.message}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {formatCurrency(propPrice)}
                    </span>
                    <span className="text-xs text-outline font-medium">/month</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {propId && (
                      <Link to={`/user/properties/${propId}`}>
                        <Button variant="outline" className="px-4 py-2 text-sm">
                          View Property
                        </Button>
                      </Link>
                    )}

                    {app.history && app.history.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedApp(app)}
                        className="px-4 py-2 text-sm"
                      >
                        Timeline
                      </Button>
                    )}

                    {app.status === "pending" && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(app.id)}
                        disabled={cancelling === app.id}
                        className="px-4 py-2 text-sm"
                      >
                        {cancelling === app.id ? "Cancelling..." : "Cancel"}
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
              Application for{" "}
              <strong>
                {selectedApp.property_title || selectedApp.property?.title || "Property"}
              </strong>
            </p>

            <div className="relative border-l-2 border-outline-variant ml-4 pl-6 space-y-6">
              {(selectedApp.history || []).map((hist, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest" />
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase block">
                      {hist.status}
                    </span>
                    <span className="text-xs text-outline block mt-0.5">
                      {hist.changed_at ? new Date(hist.changed_at).toLocaleString() : "—"}
                    </span>
                    <p className="text-body-md text-on-surface-variant mt-1">{hist.label}</p>
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
