import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "@shared/hooks/useProperties";
import Input from "@shared/components/common/Input";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";

export const PropertyManagement = () => {
  const { properties, setProperties, deleteProperty, verifyProperty } = useProperties();
  const [search, setSearch] = useState("");

  const handleDelete = (propId) => {
    if (window.confirm("Are you sure you want to remove this property registry?")) {
      deleteProperty(propId);
    }
  };

  const handleToggleVerify = (propId, currentVerify) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propId) {
          return { ...p, isVerified: !currentVerify };
        }
        return p;
      })
    );
  };

  const filteredProps = properties.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Property Registry</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Review, approve, and audit property listings submitted by landlords
        </p>
      </div>

      {/* Filter */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex gap-4">
        <Input
          placeholder="Search properties by title, address, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          containerClassName="flex-1"
        />
      </section>

      {/* Registry Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant/60">
            <thead className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Listing details</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Rent Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest font-body-md text-body-md text-on-surface">
              {filteredProps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                    No properties registered in system.
                  </td>
                </tr>
              ) : (
                filteredProps.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Link to={`/admin/properties/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                        <img src={p.images[0]} alt={p.title} className="w-12 h-10 object-cover rounded border border-outline-variant/60" />
                        <div>
                          <span className="font-bold block truncate max-w-xs">{p.title}</span>
                          <span className="text-xs text-outline font-semibold">Owner ID: {p.ownerId.toUpperCase()}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{p.address}</td>
                    <td className="px-6 py-4 font-bold text-primary">${p.price}/mo</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.isVerified ? "verified" : "unverified"} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerify(p.id, p.isVerified)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          p.isVerified
                            ? "border-outline text-outline hover:bg-surface-container-high"
                            : "border-primary text-primary hover:bg-primary-container/10"
                        }`}
                      >
                        {p.isVerified ? "Revoke Verification" : "Approve Listing"}
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 border border-error/40 text-error rounded-lg text-xs font-bold hover:bg-error-container/10 transition-colors"
                      >
                        Delete
                      </button>
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

export default PropertyManagement;
