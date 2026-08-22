import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { useApplications } from "@shared/hooks/useApplications";
import { mockReports } from "@shared/data/mockReports";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const AdminDashboard = () => {
  const { users, setUsers } = useContext(AuthContext);
  const { properties, verifyProperty } = useProperties();
  const navigate = useNavigate();

  // 1. Filter pending verifications from users list
  const pendingUsers = users.filter((u) => u.verificationDoc && u.verificationDoc.status === "Pending");

  // 2. Filter pending verifications from properties list
  const pendingProps = properties.filter((p) => !p.isVerified);

  // 3. Filter pending reports
  const pendingReports = mockReports.filter((r) => r.status === "pending");

  // Admin actions: Approve User verification
  const handleApproveUser = (userId, e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            isVerified: true,
            verificationDoc: { ...u.verificationDoc, status: "Verified" }
          };
        }
        return u;
      })
    );
    alert("User status updated to verified!");
  };

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
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full"></div>
          <h3 className="font-label-md text-label-md text-on-surface-variant">Total Members</h3>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">{users.length}</p>
          <div className="text-xs text-outline font-semibold mt-1">
            {users.filter((u) => u.role === "tenant").length} Tenants &bull; {users.filter((u) => u.role === "owner").length} Owners
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full"></div>
          <h3 className="font-label-md text-label-md text-on-surface-variant">Active Listings</h3>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">
            {properties.filter((p) => p.status === "active").length}
          </p>
          <div className="text-xs text-outline font-semibold mt-1">
            {properties.filter((p) => p.isVerified).length} Verified Units
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-tertiary/5 rounded-full"></div>
          <h3 className="font-label-md text-label-md text-on-surface-variant">Verifications Pending</h3>
          <p className="font-headline-lg text-headline-lg text-primary font-bold mt-2">
            {pendingUsers.length + pendingProps.length}
          </p>
          <div className="text-xs text-outline font-semibold mt-1">
            {pendingUsers.length} Profiles &bull; {pendingProps.length} Properties
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-error/5 rounded-full"></div>
          <h3 className="font-label-md text-label-md text-on-surface-variant">Active Reports</h3>
          <p className="font-headline-lg text-headline-lg text-error font-bold mt-2">{pendingReports.length}</p>
          <div className="text-xs text-outline font-semibold mt-1">Requires administrative audit</div>
        </div>
      </section>

      {/* Main Grid split */}
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
            {pendingUsers.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-6">
                All profile verifications have been processed!
              </p>
            ) : (
              pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        {user.name}
                      </h4>
                      <p className="text-xs text-outline font-semibold">
                        Role: {user.role.toUpperCase()} &bull; Doc: {user.verificationDoc?.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="px-3 py-1.5 border border-outline text-primary font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors font-bold"
                    >
                      Audit
                    </Link>
                    <Button
                      variant="primary"
                      onClick={(e) => handleApproveUser(user.id, e)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reports Registry preview */}
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
            {pendingReports.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-6">
                Zero active flags. Platform is clean!
              </p>
            ) : (
              pendingReports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="bg-surface p-4 rounded-xl border border-outline-variant flex justify-between items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-error font-bold">
                        {rep.title}
                      </span>
                      <StatusBadge status={rep.status} />
                    </div>
                    <p className="text-xs text-on-surface-variant truncate mt-1 leading-relaxed">
                      Reason: {rep.reason}
                    </p>
                  </div>

                  <Link
                    to={`/admin/reports`}
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
    </div>
  );
};

export default AdminDashboard;
