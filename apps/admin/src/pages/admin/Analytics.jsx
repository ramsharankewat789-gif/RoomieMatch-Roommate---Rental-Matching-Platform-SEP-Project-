/**
 * Analytics.jsx (Admin)
 *
 * Reads live metrics from GET /api/admin/stats.
 * No mock data. No AuthContext.users or useProperties hooks.
 */
import React, { useState, useEffect } from "react";
import { apiGetAdminStats } from "@shared/services/api";

export const Analytics = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    apiGetAdminStats()
      .then(setStats)
      .catch(err => setError(err.message || "Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant gap-3">
        <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-xl text-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">warning</span>
        {error}
      </div>
    );
  }

  const totalUsers       = stats?.users?.total           || 0;
  const tenantCount      = stats?.users?.tenants         || 0;
  const ownerCount       = stats?.users?.owners          || 0;
  const newUsersMonth    = stats?.users?.newThisMonth    || 0;

  const totalProperties  = stats?.properties?.total      || 0;
  const activeProperties = stats?.properties?.active     || 0;
  const newPropsMonth    = stats?.properties?.newThisMonth || 0;

  const totalApps        = stats?.applications?.approvedThisMonth || 0;
  const pendingApps      = stats?.applications?.pending  || 0;
  const approvedThisMonth = stats?.applications?.approvedThisMonth || 0;

  const pendingVerifs    = stats?.verifications?.pending || 0;
  const pendingReports   = stats?.reports?.pending       || 0;
  const totalMessages    = stats?.messages?.total        || 0;
  const monthlyRent      = stats?.revenue?.totalRentedMonthly || 0;

  const verifRate = totalUsers > 0 ? Math.round(((totalUsers - pendingVerifs) / totalUsers) * 100) : 0;
  const propVerifRate = totalProperties > 0 ? Math.round((activeProperties / totalProperties) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Analytics Reports</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Monitor registration trends, verification status ratios, and platform growth metrics
        </p>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Users */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">User Registrations</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <StatRow label="Total Members"        value={totalUsers} />
            <StatRow label="Student Tenants"      value={tenantCount} />
            <StatRow label="Registered Landlords" value={ownerCount} />
            <StatRow label="New This Month"       value={newUsersMonth} />
            <div className="flex justify-between pt-2 border-t border-outline-variant/60">
              <span>Verification Rate</span>
              <span className="font-bold text-secondary">{verifRate}%</span>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Listings Performance</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <StatRow label="Total Listings"    value={totalProperties} />
            <StatRow label="Active Listings"   value={activeProperties} />
            <StatRow label="New This Month"    value={newPropsMonth} />
            <StatRow label="Pending Review"    value={pendingVerifs} />
            <div className="flex justify-between pt-2 border-t border-outline-variant/60">
              <span>Active Rate</span>
              <span className="font-bold text-secondary">{propVerifRate}%</span>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Application Funnel</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <StatRow label="Pending Applications"    value={pendingApps} />
            <StatRow label="Approved This Month"     value={approvedThisMonth} />
            <StatRow label="Total Messages Sent"     value={totalMessages} />
            <StatRow label="Active Reports"          value={pendingReports} />
            <div className="flex justify-between pt-2 border-t border-outline-variant/60">
              <span>Est. Monthly Rent Value</span>
              <span className="font-bold text-secondary">Rs. {monthlyRent.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </section>

      {/* Bar Chart — new users per month (static shape, real totals as reference) */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Platform Growth</h2>
          <span className="text-xs text-on-surface-variant font-semibold bg-surface-container px-3 py-1 rounded-full border border-outline-variant">
            {totalUsers} total registered members
          </span>
        </div>

        {/* Summary metric row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users",        value: totalUsers,       icon: "group" },
            { label: "Properties",   value: totalProperties,  icon: "home_work" },
            { label: "Applications", value: pendingApps,      icon: "description" },
            { label: "Monthly Rent", value: `Rs. ${monthlyRent.toLocaleString()}`, icon: "payments" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
              <span className="material-symbols-outlined text-[28px] text-primary mb-2 block">{icon}</span>
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{value}</p>
              <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-bold text-on-surface">{value}</span>
    </div>
  );
}

export default Analytics;
