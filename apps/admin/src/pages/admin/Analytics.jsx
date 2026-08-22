import React, { useContext } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { useApplications } from "@shared/hooks/useApplications";

export const Analytics = () => {
  const { users } = useContext(AuthContext);
  const { properties } = useProperties();
  const { applications } = useApplications();

  const totalUsers = users.length;
  const tenantsCount = users.filter((u) => u.role === "tenant").length;
  const ownersCount = users.filter((u) => u.role === "owner").length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;

  const totalProperties = properties.length;
  const activeProperties = properties.filter((p) => p.status === "active").length;
  const verifiedProperties = properties.filter((p) => p.isVerified).length;

  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === "approved").length;
  const pendingApps = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Analytics Reports</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Monitor registration trends, verification status ratios, and platform growth metrics
        </p>
      </div>

      {/* Numerical Metrics Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">User Registrations</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Total Members</span>
              <span className="font-bold text-on-surface">{totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Student Tenants</span>
              <span className="font-bold text-on-surface">{tenantsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Registered Landlords</span>
              <span className="font-bold text-on-surface">{ownersCount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Verification Rate</span>
              <span className="font-bold text-secondary">
                {Math.round((verifiedUsers / (totalUsers || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Listings Performance</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Total Listings</span>
              <span className="font-bold text-on-surface">{totalProperties}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Listings</span>
              <span className="font-bold text-on-surface">{activeProperties}</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Properties</span>
              <span className="font-bold text-on-surface">{verifiedProperties}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Verification Rate</span>
              <span className="font-bold text-secondary">
                {Math.round((verifiedProperties / (totalProperties || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Application funnel</h2>
          <div className="space-y-2 text-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Applications Submitted</span>
              <span className="font-bold text-on-surface">{totalApps}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved Applications</span>
              <span className="font-bold text-on-surface">{approvedApps}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Reviews</span>
              <span className="font-bold text-on-surface">{pendingApps}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Lease Conversion Rate</span>
              <span className="font-bold text-secondary">
                {Math.round((approvedApps / (totalApps || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual representation of data distributions */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Growth Trends</h2>
        <div className="h-64 flex items-end gap-3 justify-between px-6 pt-6 border-b border-l border-outline-variant">
          {/* Mock Bar chart */}
          {[
            { month: "Jan", val: 30 },
            { month: "Feb", val: 45 },
            { month: "Mar", val: 60 },
            { month: "Apr", val: 55 },
            { month: "May", val: 80 },
            { month: "Jun", val: 95 },
            { month: "Jul", val: 120 },
            { month: "Aug", val: 150 }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.val} users
              </span>
              <div
                className="w-full bg-primary-container hover:bg-primary transition-colors rounded-t-md"
                style={{ height: `${(bar.val / 150) * 160}px` }}
              ></div>
              <span className="text-xs font-semibold text-outline-variant mt-2">{bar.month}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Analytics;
