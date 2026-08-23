/**
 * ReportsDetails.jsx (Admin)
 *
 * Loads a single report from GET /api/reports/:id (real MySQL backend).
 * Resolve / dismiss via PATCH /api/reports/:id.
 * No mock data. No localStorage. No AuthContext.users lookup.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetReport, apiUpdateReport } from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";
import Textarea from "@shared/components/common/Textarea";

export const ReportsDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [report,        setReport]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [pageError,     setPageError]     = useState("");
  const [resolution,    setResolution]    = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    apiGetReport(id)
      .then(data => setReport(data.report))
      .catch(err => setPageError(err.message || "Report not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (status) => {
    setActionLoading(true);
    try {
      await apiUpdateReport(id, status, resolution.trim() || null);
      setReport(prev => ({ ...prev, status }));
      navigate("/admin/reports");
    } catch (err) {
      alert(err.message || `Failed to mark as ${status}.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading report...
      </div>
    );
  }

  if (pageError || !report) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl p-8">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">Report Not Found</h3>
        <p className="text-body-md text-on-surface-variant mt-2">{pageError}</p>
        <Link to="/admin/reports" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link
            to="/admin/reports"
            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1 mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Reports
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={report.status} />
            <span className="text-xs text-outline font-semibold">
              {report.created_at ? new Date(report.created_at).toLocaleString() : ""}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{report.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Evidence + Actions */}
        <div className="lg:col-span-2 space-y-6">

          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-error" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error">warning</span>
              Reported Content
            </h3>
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant italic text-on-surface-variant">
              "{report.reason}"
            </div>

            {report.resolution && (
              <div className="mt-4 bg-surface p-4 rounded-lg border border-outline-variant">
                <span className="text-xs text-outline font-bold uppercase tracking-wider block mb-1">Resolution</span>
                <p className="text-body-md text-on-surface">{report.resolution}</p>
              </div>
            )}
          </section>

          {report.status === "pending" && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Resolution Actions</h3>
              <Textarea
                label="Resolution Note"
                placeholder="Describe the action taken (e.g. user warned, listing removed)..."
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAction("resolved")}
                  disabled={actionLoading}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-error text-error hover:bg-error-container/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[32px]">block</span>
                  <span className="font-label-md text-label-md">
                    {actionLoading ? "Processing..." : "Take Action"}
                  </span>
                </button>
                <button
                  onClick={() => handleAction("dismissed")}
                  disabled={actionLoading}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[32px]">close</span>
                  <span className="font-label-md text-label-md">Dismiss Report</span>
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right: Parties */}
        <div className="space-y-4">

          {/* Reporter */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4">
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
              Reporter
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={report.reporter_name} size="md" />
              <div>
                <p className="font-label-md text-label-md text-on-surface font-bold">{report.reporter_name || "Anonymous"}</p>
                <p className="text-xs text-on-surface-variant">{report.reporter_email || ""}</p>
              </div>
            </div>
            {report.reporter_id && (
              <Link to={`/admin/users/${report.reporter_id}`}>
                <Button variant="outline" className="w-full text-sm">View Profile</Button>
              </Link>
            )}
          </section>

          {/* Reported User */}
          {report.reported_user_id && (
            <section className="bg-surface-container-lowest rounded-xl border border-error shadow-sm p-4">
              <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-error">gavel</span>
                Reported User
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={report.reported_user_name} size="md" />
                <p className="font-label-md text-label-md text-on-surface font-bold">
                  {report.reported_user_name || "Unknown User"}
                </p>
              </div>
              <Link to={`/admin/users/${report.reported_user_id}`}>
                <Button variant="outline" className="w-full text-sm">View Profile</Button>
              </Link>
            </section>
          )}

          {/* Reported Property */}
          {report.reported_property_id && (
            <section className="bg-surface-container-lowest rounded-xl border border-error shadow-sm p-4">
              <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">
                Reported Property
              </h3>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                {report.reported_property_title || "Unknown Property"}
              </p>
              <Link to={`/admin/properties/${report.reported_property_id}`} className="mt-3 block">
                <Button variant="outline" className="w-full text-sm">View Property</Button>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDetails;
