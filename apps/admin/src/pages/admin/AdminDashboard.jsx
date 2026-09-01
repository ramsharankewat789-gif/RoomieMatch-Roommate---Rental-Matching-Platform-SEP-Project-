/**
 * AdminDashboard.jsx
 *
 * Reads all metrics from the real backend:
 *   GET /api/admin/stats    — user/property/verification/report counts
 *   GET /api/admin/activity — recent users, properties, applications, reports
 *
 * No mock data. No AuthContext.users dependency.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGetAdminStats, apiGetAdminActivity, apiListPendingVerifications } from "@shared/services/api";
import StatusBadge from "@shared/components/common/StatusBadge";
import LoadingSpinner from "@shared/components/common/LoadingSpinner";

export const AdminDashboard = () => {
  const [stats, setStats]             = useState(null);
  const [activity, setActivity]       = useState(null);
  const [pendingVerifs, setPendingVerifs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, activityData, verifData] = await Promise.all([
          apiGetAdminStats(),
          apiGetAdminActivity(5),
          apiListPendingVerifications(),
        ]);
        setStats(statsData);
        setActivity(activityData);
        setPendingVerifs(verifData.verifications || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-xl text-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">warning</span>
        {error}
      </div>
    );
  }

  const totalMembers      = (stats?.users?.total           || 0);
  const tenantCount       = (stats?.users?.tenants         || 0);
  const ownerCount        = (stats?.users?.owners          || 0);
  const activeListings    = (stats?.properties?.active     || 0);
  const totalProperties   = (stats?.properties?.total      || 0);
  const pendingVerifCount = (stats?.verifications?.pending || 0);
  const pendingReports    = (stats?.reports?.pending       || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Overview Title */}
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Platform Control Center</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          System Overview &bull; Administrative Operations
        </p>
      </div>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Members"
          value={totalMembers}
          sub={`${tenantCount} Tenants · ${ownerCount} Owners`}
          accent="primary"
        />
        <MetricCard
          label="Active Listings"
          value={activeListings}
          sub={`${totalProperties} total properties`}
          accent="secondary"
        />
        <MetricCard
          label="Verifications Pending"
          value={pendingVerifCount}
          sub="Profiles awaiting review"
          accent="tertiary"
        />
        <MetricCard
          label="Active Reports"
          value={pendingReports}
          sub="Requires administrative audit"
          accent="error"
        />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Verification Queue Preview */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Pending Verifications Queue
            </h2>
            <Link to="/admin/verifications" className="text-primary font-label-md text-label-md hover:underline font-bold flex items-center gap-0.5">
              Manage Queue
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {pendingVerifs.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-6">
                All profile verifications have been processed!
              </p>
            ) : (
              pendingVerifs.slice(0, 3).map((v) => (
                <div key={v.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant flex justify-between items-center gap-4"
                >
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">{v.name}</h4>
                    <p className="text-xs text-outline font-semibold capitalize">
                      {v.role} · {v.document_type}
                    </p>
                  </div>
                  <Link
                    to="/admin/verifications"
                    className="px-3 py-1.5 border border-outline text-primary font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors font-bold"
                  >
                    Audit
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Reports */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Recent Reports
            </h2>
            <Link to="/admin/reports" className="text-primary font-label-md text-label-md hover:underline font-bold flex items-center gap-0.5">
              Review Panel
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {(activity?.recentReports || []).length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-6">
                Zero active flags. Platform is clean!
              </p>
            ) : (
              (activity?.recentReports || []).slice(0, 3).map((rep) => (
                <div key={rep.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant flex justify-between items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-error font-bold truncate">{rep.title}</span>
                      <StatusBadge status={rep.status} />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Reporter: {rep.reporter_name}
                    </p>
                  </div>
                  <Link
                    to="/admin/reports"
                    className="px-4 py-2 border border-outline text-primary font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors font-bold shrink-0"
                  >
                    Investigate
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* Recent Activity — users + properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Registrations</h2>
            <Link to="/admin/users" className="text-primary font-label-md text-label-md hover:underline font-bold flex items-center gap-0.5">
              All Users <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-3">
            {(activity?.recentUsers || []).slice(0, 5).map(u => (
              <div key={u.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-on-surface">{u.name}</span>
                  <span className="text-xs text-outline ml-2 capitalize">{u.role}</span>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(activity?.recentUsers || []).length === 0 && (
              <p className="text-on-surface-variant text-sm py-4 text-center">No recent registrations.</p>
            )}
          </div>
        </section>

        {/* Recent Properties */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Listings</h2>
            <Link to="/admin/properties" className="text-primary font-label-md text-label-md hover:underline font-bold flex items-center gap-0.5">
              All Properties <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-3">
            {(activity?.recentProperties || []).slice(0, 5).map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-on-surface truncate block">{p.title}</span>
                  <span className="text-xs text-outline">{p.owner_name} · ${p.price}/mo</span>
                </div>
                <StatusBadge status={p.is_verified ? "verified" : "unverified"} />
              </div>
            ))}
            {(activity?.recentProperties || []).length === 0 && (
              <p className="text-on-surface-variant text-sm py-4 text-center">No recent listings.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

function MetricCard({ label, value, sub, accent }) {
  const accentClass = {
    primary:   "bg-primary/5",
    secondary: "bg-secondary/5",
    tertiary:  "bg-tertiary/5",
    error:     "bg-error/5",
  }[accent] || "bg-primary/5";

  const valueClass = {
    primary:   "text-on-surface",
    secondary: "text-on-surface",
    tertiary:  "text-primary",
    error:     "text-error",
  }[accent] || "text-on-surface";

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-20 h-20 ${accentClass} rounded-full`} />
      <h3 className="font-label-md text-label-md text-on-surface-variant">{label}</h3>
      <p className={`font-headline-lg text-headline-lg font-bold mt-2 ${valueClass}`}>{value}</p>
      <div className="text-xs text-outline font-semibold mt-1">{sub}</div>
    </div>
  );
}

export default AdminDashboard;
