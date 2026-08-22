import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { mockReports } from "@shared/data/mockReports";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const ReportsManagement = () => {
  const { users } = useContext(AuthContext);
  const { properties } = useProperties();
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem("roomiematch_reports");
    return saved ? JSON.parse(saved) : mockReports;
  });

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionComment, setResolutionComment] = useState("");

  const saveReports = (newList) => {
    setReports(newList);
    localStorage.setItem("roomiematch_reports", JSON.stringify(newList));
  };

  const handleAction = (status) => {
    if (!selectedReport) return;
    
    const updated = reports.map((r) => {
      if (r.id === selectedReport.id) {
        return {
          ...r,
          status,
          resolution: status === "resolved" ? resolutionComment : "Dismissed by Admin",
          resolvedAt: new Date().toISOString()
        };
      }
      return r;
    });

    saveReports(updated);
    setSelectedReport(null);
    setResolutionComment("");
    alert(`Report marked as ${status}.`);
  };

  const getReporterName = (reporterId) => {
    return users.find((u) => u.id === reporterId)?.name || "Anonymous";
  };

  const getTargetName = (rep) => {
    if (rep.reportedUserId) {
      return `User: ${users.find((u) => u.id === rep.reportedUserId)?.name || "Unknown"}`;
    }
    if (rep.reportedPropertyId) {
      return `Property: ${properties.find((p) => p.id === rep.reportedPropertyId)?.title || "Unknown"}`;
    }
    return "Unknown Entity";
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Reports Panel</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Review user flags, policy violations, and property listings complaints
          </p>
        </div>
        <div className="w-52 shrink-0">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
              { value: "dismissed", label: "Dismissed" }
            ]}
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/60">
            <thead className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Report Details</th>
                <th className="px-6 py-4">Filer</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest font-body-md text-body-md text-on-surface">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    No active policy reports in queue.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4 font-bold text-error">{r.title}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{getReporterName(r.reporterId)}</td>
                    <td className="px-6 py-4 font-semibold">{getTargetName(r)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/admin/reports/${r.id}`}>
                        <Button variant="outline" className="px-3.5 py-1.5 text-xs font-bold inline-block text-center">
                          Investigate
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReport(r)}
                        className="px-3.5 py-1.5 text-xs font-bold inline-block text-center"
                      >
                        Quick Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Details Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Audit Flagged Content"
        footer={
          selectedReport && selectedReport.status === "pending" ? (
            <>
              <Button variant="outline" onClick={() => handleAction("dismissed")}>
                Dismiss Report
              </Button>
              <Button variant="danger" onClick={() => handleAction("resolved")} disabled={!resolutionComment.trim()}>
                Resolve & Update
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close Audit
            </Button>
          )
        }
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-on-surface-variant">
              <div>
                <span className="text-outline uppercase tracking-wider block">Filer</span>
                <span className="text-on-surface font-bold">{getReporterName(selectedReport.reporterId)}</span>
              </div>
              <div>
                <span className="text-outline uppercase tracking-wider block">Target Subject</span>
                <span className="text-on-surface font-bold">{getTargetName(selectedReport)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/60">
              <span className="text-xs text-outline font-bold uppercase tracking-wider block mb-1">Reason / Complaint</span>
              <p className="text-body-md text-on-surface-variant leading-relaxed bg-surface p-4 rounded-lg border border-outline-variant/60 italic">
                "{selectedReport.reason}"
              </p>
            </div>

            {selectedReport.status === "pending" ? (
              <div className="pt-4 border-t border-outline-variant/60 space-y-2">
                <span className="text-xs text-outline font-bold uppercase tracking-wider block">Resolution Log Note</span>
                <Textarea
                  placeholder="Explain actions taken (e.g. user warned, listing deleted, credentials corrected)..."
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            ) : (
              <div className="pt-4 border-t border-outline-variant/60 p-4 bg-surface rounded-lg border border-outline-variant/60">
                <span className="text-xs text-outline font-bold uppercase tracking-wider block mb-1">Audit Resolution</span>
                <p className="text-body-md font-semibold text-on-surface">
                  {selectedReport.resolution}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsManagement;
