/**
 * ReportsManagement.jsx (Admin)
 *
 * Reads all reports from GET /api/reports (real MySQL backend).
 * Resolve / dismiss via PATCH /api/reports/:id.
 * No mock data. No localStorage.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiListReports, apiUpdateReport } from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const ReportsManagement = () => {
  const [reports,       setReports]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionComment, setResolutionComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const data = await apiListReports(params);
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (status) => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await apiUpdateReport(selectedReport.id, status, resolutionComment.trim() || null);
      setReports(prev =>
        prev.map(r => r.id === selectedReport.id ? { ...r, status } : r)
      );
      setSelectedReport(null);
      setResolutionComment("");
    } catch (err) {
      alert(err.message || `Failed to mark as ${status}.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Reports Panel</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Review user flags, policy violations, and property listing complaints
          </p>
        </div>
        <div className="w-52 shrink-0">
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: "",          label: "All Statuses" },
              { value: "pending",   label: "Pending" },
              { value: "resolved",  label: "Resolved" },
              { value: "dismissed", label: "Dismissed" },
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>{error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/60">
            <thead className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Report Details</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Loading reports...
                  </span>
                </td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                  No reports in queue.
                </td></tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4 font-bold text-error">{r.title}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{r.reporter_name || "—"}</td>
                    <td className="px-6 py-4 font-semibold">
                      {r.reported_user_name
                        ? `User: ${r.reported_user_name}`
                        : r.reported_property_title
                          ? `Property: ${r.reported_property_title}`
                          : "—"}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/admin/reports/${r.id}`}>
                        <Button variant="outline" className="px-3.5 py-1.5 text-xs font-bold inline-block">
                          Investigate
                        </Button>
                      </Link>
                      {r.status === "pending" && (
                        <Button
                          variant="outline"
                          onClick={() => { setSelectedReport(r); setResolutionComment(""); }}
                          className="px-3.5 py-1.5 text-xs font-bold inline-block"
                        >
                          Quick Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Review Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Quick Report Review"
        footer={
          <>
            <Button variant="outline" onClick={() => handleAction("dismissed")} disabled={actionLoading}>
              Dismiss
            </Button>
            <Button variant="danger" onClick={() => handleAction("resolved")} disabled={actionLoading || !resolutionComment.trim()}>
              {actionLoading ? "Processing..." : "Resolve"}
            </Button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-4">
            <p className="text-body-md text-on-surface-variant">
              <strong>Title:</strong> {selectedReport.title}
            </p>
            <div className="bg-surface p-4 rounded-lg border border-outline-variant/60 italic text-on-surface-variant">
              "{selectedReport.reason}"
            </div>
            <Textarea
              label="Resolution Note"
              placeholder="Explain action taken (e.g. user warned, listing removed)..."
              value={resolutionComment}
              onChange={e => setResolutionComment(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsManagement;
