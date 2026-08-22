/**
 * UserManagement.jsx (Admin)
 *
 * Reads users from GET /api/users (paginated, searchable).
 * Delete via DELETE /api/users/:id.
 * No AuthContext.users dependency — all data from real MySQL backend.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiListUsers, apiDeleteUser } from "@shared/services/api";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import StatusBadge from "@shared/components/common/StatusBadge";
import Avatar from "@shared/components/common/Avatar";

export const UserManagement = () => {
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage]             = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const data = await apiListUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  // Debounce search: re-fetch 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}? This removes all their data permanently.`)) return;
    try {
      await apiDeleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    }
  };

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
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          containerClassName="flex-1"
        />
        <div className="w-52 shrink-0">
          <Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            options={[
              { value: "",      label: "All Roles" },
              { value: "user",  label: "Users (Tenant / Owner)" },
              { value: "admin", label: "Administrators" },
            ]}
          />
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>{error}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/60">
            <thead className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4">
                      <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80">
                        <Avatar src={user.profile_image} name={user.name} size="sm" />
                        <div>
                          <span className="font-bold block">{user.name}</span>
                          <span className="text-xs text-outline font-semibold capitalize">
                            {user.role}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4 capitalize font-semibold">{user.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={
                        user.verification_status === "APPROVED" ? "verified"
                        : user.verification_status === "PENDING"  ? "pending"
                        : user.is_verified ? "verified"
                        : "unverified"
                      } />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="px-3 py-1.5 border border-outline text-primary rounded-lg text-xs font-bold hover:bg-surface-container-low transition-colors"
                      >
                        View
                      </Link>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
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

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/60 flex items-center justify-between text-sm text-on-surface-variant">
            <span>{pagination.total} users total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-surface-container-low transition-colors"
              >
                Previous
              </button>
              <span className="font-semibold text-on-surface">Page {page} / {pagination.pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-surface-container-low transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
