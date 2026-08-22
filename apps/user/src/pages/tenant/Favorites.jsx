import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import EmptyState from "@shared/components/common/EmptyState";

export const Favorites = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const { properties } = useProperties();

  const favIds = currentUser?.favorites || [];
  const favoritedProps = properties.filter((p) => favIds.includes(p.id) && p.status === "active");

  const handleRemoveFavorite = (propId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favIds.filter((id) => id !== propId);
    updateProfile({ favorites: newFavs });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">My Favorite Listings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Review and manage the properties you bookmarked
        </p>
      </div>

      {favoritedProps.length === 0 ? (
        <EmptyState
          icon="favorite"
          title="No favorites yet"
          description="Browse available properties near campus and tap the heart icon to save them here."
          actionText="Find Properties"
          onActionClick={() => {
            window.location.href = "/user/properties";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favoritedProps.map((prop) => (
            <Link
              key={prop.id}
              to={`/tenant/properties/${prop.id}`}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div className="relative h-48 w-full bg-surface-container">
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={(e) => handleRemoveFavorite(prop.id, e)}
                  className="absolute top-3 right-3 p-2 bg-surface-container-lowest/90 hover:bg-surface-container-lowest border border-outline-variant rounded-full text-error flex items-center justify-center shadow-sm select-none"
                  title="Remove Favorite"
                >
                  <span className="material-symbols-outlined text-[20px] icon-fill">
                    favorite
                  </span>
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors truncate">
                    {prop.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-medium mt-1 truncate">
                    {prop.address}, {prop.city}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium mt-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bed</span>
                      {prop.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bathtub</span>
                      {prop.bathrooms} Bath
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/60 flex justify-between items-center">
                  <div>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      ${prop.price}
                    </span>
                    <span className="text-xs text-outline font-medium">/month</span>
                  </div>
                  <span className="text-xs text-primary font-bold flex items-center gap-0.5">
                    View Details
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
