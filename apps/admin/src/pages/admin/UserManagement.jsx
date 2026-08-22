import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";

export const UserManagement = () => {
  const { users, setUsers } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will delete all their listings and data permanently.")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleToggleVerification = (userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextVerified = !u.isVerified;
          return {
            ...u,
            isVerified: nextVerified,
            verificationDoc: {
              ...u.verificationDoc,
              status: nextVerified ? "Verified" : "Unverified"
            }
          };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter && u.role !== roleFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">User Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Review, approve, and audit student and landlord member profiles
        </p>
      </div>

      {/* Filters */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search name, email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          containerClassName="flex-1"
        />
        <div className="w-52 shrink-0">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: "", label: "All Roles" },
              { value: "tenant", label: "Tenant" },
              { value: "owner", label: "Landlord / Owner" },
              { value: "admin", label: "Administrator" }
            ]}
          />
        </div>
      </section>

      {/* User Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/60">
            <thead className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Account Type</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest font-body-md text-body-md text-on-surface">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div>
                        <span className="font-bold block">{user.name}</span>
                        <span className="text-xs text-outline font-semibold">ID: {user.id.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4 capitalize font-semibold">{user.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.isVerified ? "verified" : user.verificationDoc?.status || "unverified"} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerification(user.id)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          user.isVerified
                            ? "border-outline text-outline hover:bg-surface-container-high"
                            : "border-primary text-primary hover:bg-primary-container/10"
                        }`}
                      >
                        {user.isVerified ? "Revoke Verification" : "Verify User"}
                      </button>

                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1.5 border border-error/40 text-error rounded-lg text-xs font-bold hover:bg-error-container/10 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
