import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import Button from "@shared/components/common/Button";
import StatusBadge from "@shared/components/common/StatusBadge";
import EmptyState from "@shared/components/common/EmptyState";

export const MyProperties = () => {
  const { currentUser } = useContext(AuthContext);
  const { properties, setProperties, deleteProperty } = useProperties();

  const myProperties = properties.filter((p) => p.ownerId === currentUser?.id);

  const toggleStatus = (propId) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propId) {
          const nextStatus = p.status === "active" ? "inactive" : "active";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleDelete = (propId) => {
    if (window.confirm("Are you sure you want to delete this property listing? This cannot be undone.")) {
      deleteProperty(propId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">My Properties</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Register and manage your rental listings
          </p>
        </div>
        <Link
          to="/user/my-properties/add"
          className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-surface-tint transition-all flex items-center justify-center gap-1 select-none"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Property
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <EmptyState
          icon="home"
          title="No properties listed yet"
          description="Register your first rental unit to receive student housing applications."
          actionText="Add a Property"
          onActionClick={() => {
            window.location.href = "/user/my-properties/add";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow relative"
            >
              {/* Image banner */}
              <div className="relative h-44 bg-surface-container">
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />

                {/* Active / Inactive Badge */}
                <div className="absolute top-3 left-3 bg-surface-container-lowest/90 border border-outline-variant px-2.5 py-0.5 rounded-md font-label-sm text-label-sm font-bold flex items-center gap-0.5">
                  <StatusBadge status={prop.status} />
                </div>

                {/* Verified badge */}
                {prop.isVerified && (
                  <div className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-md border border-secondary font-label-sm text-label-sm font-bold flex items-center gap-0.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px] icon-fill">verified</span>
                    Verified
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                    {prop.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-medium mt-1 truncate">
                    {prop.address}, {prop.city}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-outline mt-3">
                    <span>{prop.bedrooms} Bedrooms</span>
                    <span>{prop.bathrooms} Bathrooms</span>
                    <span>{prop.type}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    ${prop.price}<span className="text-xs text-outline font-normal">/mo</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/user/my-properties/${prop.id}`}
                      className="p-2 border border-outline text-primary rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center"
                      title="View Property"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </Link>
                    <button
                      onClick={() => toggleStatus(prop.id)}
                      className={`p-2 border rounded-lg transition-colors ${
                        prop.status === "active"
                          ? "border-outline text-outline hover:bg-surface-container-high"
                          : "border-primary text-primary hover:bg-primary-container/10"
                      }`}
                      title={prop.status === "active" ? "Deactivate Listing" : "Activate Listing"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {prop.status === "active" ? "visibility_off" : "visibility"}
                      </span>
                    </button>

                    <Link
                      to={`/user/my-properties/${prop.id}/edit`}
                      className="p-2 border border-outline text-primary rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center"
                      title="Edit Property"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 border border-error/40 text-error rounded-lg hover:bg-error-container/10 transition-colors flex items-center justify-center"
                      title="Delete Property"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
