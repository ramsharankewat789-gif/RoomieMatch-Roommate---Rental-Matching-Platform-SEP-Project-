import React, { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { mockReports } from "@shared/data/mockReports";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const ReportsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useContext(AuthContext);
  const { properties } = useProperties();
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem("roomiematch_reports");
    return saved ? JSON.parse(saved) : mockReports;
  });

  const report = reports.find((r) => r.id === id);
  const reporter = users.find((u) => u.id === report?.reporterId);
  const reportedUser = users.find((u) => u.id === report?.reportedUserId);
  const reportedProperty = properties.find((p) => p.id === report?.reportedPropertyId);

  if (!report) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">Report Not Found</h3>
        <Link to="/admin/reports" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  const saveReports = (updated) => {
    setReports(updated);
    localStorage.setItem("roomiematch_reports", JSON.stringify(updated));
  };

  const handleAction = (status) => {
    const updated = reports.map((r) =>
      r.id === report.id
        ? {
            ...r,
            status,
            resolution: status === "resolved" ? "Action taken by admin" : "Dismissed by admin",
            resolvedAt: new Date().toISOString()
          }
        : r
    );
    saveReports(updated);
    alert(`Report marked as ${status}.`);
    navigate("/admin/reports");
  };

  return (
    <div className="space-y-section-margin max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/reports"
            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1 mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Reports
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              Report #{report.id.toUpperCase()}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{report.title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Submitted on {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        <div className="lg:col-span-2 flex flex-col gap-card-gap">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-error" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error">warning</span>
              Reported Evidence
            </h3>
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant mb-4">
              <p className="font-body-lg text-body-lg text-on-surface">"{report.reason}"</p>
            </div>
            {report.resolution && (
              <div className="mt-4">
                <h4 className="font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                  Resolution
                </h4>
                <p className="font-body-md text-body-md text-on-surface bg-surface-container p-3 rounded-lg border border-outline-variant">
                  {report.resolution}
                </p>
              </div>
            )}
          </section>

          {report.status === "pending" && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Resolution Actions</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Select an action to resolve this report. This will notify the reporter and update records.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleAction("resolved")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-error text-error hover:bg-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[32px]">block</span>
                  <span className="font-label-md text-label-md">Take Action</span>
                </button>
                <button
                  onClick={() => handleAction("dismissed")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[32px]">close</span>
                  <span className="font-label-md text-label-md">Dismiss Report</span>
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-card-gap">
          {reportedUser && (
            <section className="bg-surface-container-lowest rounded-xl border border-error shadow-sm p-4">
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-error">gavel</span>
                Reported User
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={reportedUser.avatar} name={reportedUser.name} size="md" />
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{reportedUser.name}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">{reportedUser.email}</p>
                </div>
              </div>
              <Link to={`/admin/users/${reportedUser.id}`}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  View Full Profile
                </Button>
              </Link>
            </section>
          )}

          {reportedProperty && (
            <section className="bg-surface-container-lowest rounded-xl border border-error shadow-sm p-4">
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4">
                Reported Property
              </h3>
              <p className="font-headline-sm text-headline-sm text-on-surface mb-2">{reportedProperty.title}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {reportedProperty.address}, {reportedProperty.city}
              </p>
              <Link to={`/admin/properties/${reportedProperty.id}`}>
                <Button variant="outline" className="w-full">
                  View Property Details
                </Button>
              </Link>
            </section>
          )}

          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
              Reporter
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={reporter?.avatar} name={reporter?.name} size="md" />
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{reporter?.name || "Anonymous"}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  {reporter?.isVerified ? "Verified User" : "User"}
                </p>
              </div>
            </div>
            {reporter && (
              <Link to={`/admin/users/${reporter.id}`}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  View Full Profile
                </Button>
              </Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportsDetails;
