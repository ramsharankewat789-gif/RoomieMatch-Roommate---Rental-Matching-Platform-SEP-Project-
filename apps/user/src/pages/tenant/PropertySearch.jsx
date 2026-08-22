import React, { useState, useContext, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProperties } from "@shared/hooks/useProperties";
import { AuthContext } from "@shared/context/AuthContext";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import EmptyState from "@shared/components/common/EmptyState";

export const PropertySearch = () => {
  const { properties } = useProperties();
  const { currentUser, updateProfile } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  // Search & Filters state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [maxPrice, setMaxPrice] = useState("");
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Check URL query parameters on load
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleFavoriteToggle = (propId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) return;
    
    const favs = currentUser.favorites || [];
    const isFav = favs.includes(propId);
    
    let newFavs;
    if (isFav) {
      newFavs = favs.filter(id => id !== propId);
    } else {
      newFavs = [...favs, propId];
    }
    
    updateProfile({ favorites: newFavs });
  };

  const isFavorite = (propId) => {
    return (currentUser?.favorites || []).includes(propId);
  };

  // Filter logic
  const filteredProperties = properties.filter((p) => {
    if (p.status !== "active") return false;
    
    // Text search (Title, address, description, city)
    if (search) {
      const q = search.toLowerCase();
      const matchText =
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    
    // Max price
    if (maxPrice && p.price > Number(maxPrice)) {
      return false;
    }
    
    // Property type
    if (type && p.type !== type) {
      return false;
    }
    
    // Bedrooms
    if (bedrooms) {
      if (bedrooms === "3+") {
        if (p.bedrooms < 3) return false;
      } else if (p.bedrooms !== Number(bedrooms)) {
        if (!(bedrooms === "1" && p.type.toLowerCase() === "studio")) {
          return false;
        }
      }
    }
    
    // Amenities
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every(a => p.amenities.includes(a));
      if (!hasAll) return false;
    }
    
    return true;
  });

  const amenitiesList = [
    "Wifi",
    "Air Conditioning",
    "On-site Laundry",
    "In-unit Laundry",
    "Parking Spot",
    "Garage Parking",
    "Fully Furnished",
    "Dishwasher",
    "Private Backyard"
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Apartment", label: "Apartment" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Studio", label: "Studio" }
  ];

  const bedroomOptions = [
    { value: "", label: "Any Bedrooms" },
    { value: "1", label: "1 Bedroom / Studio" },
    { value: "2", label: "2 Bedrooms" },
    { value: "3+", label: "3+ Bedrooms" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Search Verified Properties</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Browse rental rooms and whole units verified by university guidelines
        </p>
      </div>

      {/* Filters Section */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search address, city, university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="search"
          />
          <Input
            placeholder="Max Budget ($ / month)"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            icon="payments"
          />
          <Select
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Select
            options={bedroomOptions}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>

        {/* Amenities Toggles */}
        <div className="pt-2">
          <span className="font-label-md text-label-md text-on-surface-variant font-bold block mb-2">
            Amenities Filter
          </span>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((amenity) => {
              const isSel = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSel
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Properties Display */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon="home"
          title="No rentals match your filters"
          description="Try broadening your search criteria or resetting filters to see available units."
          actionText="Reset All Filters"
          onActionClick={() => {
            setSearch("");
            setMaxPrice("");
            setType("");
            setBedrooms("");
            setSelectedAmenities([]);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <Link
              key={prop.id}
              to={`/tenant/properties/${prop.id}`}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              {/* Card Image */}
              <div className="relative h-48 w-full bg-surface-container">
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Verification Badge */}
                {prop.isVerified && (
                  <div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm border border-secondary flex items-center gap-0.5 font-bold shadow-sm">
                    <span className="material-symbols-outlined text-sm icon-fill">verified</span>
                    VERIFIED
                  </div>
                )}

                {/* Favorite Toggle Button */}
                <button
                  onClick={(e) => handleFavoriteToggle(prop.id, e)}
                  className="absolute top-3 right-3 p-2 bg-surface-container-lowest/90 hover:bg-surface-container-lowest border border-outline-variant rounded-full text-error hover:scale-115 transition-transform flex items-center justify-center shadow-sm select-none"
                  title={isFavorite(prop.id) ? "Remove Favorite" : "Add Favorite"}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isFavorite(prop.id) ? "icon-fill" : ""}`}>
                    favorite
                  </span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs text-outline font-semibold mb-1">
                    <span>{prop.type.toUpperCase()}</span>
                    <span>AVAILABLE {prop.availableFrom}</span>
                  </div>
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
                  <span className="text-xs text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
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

export default PropertySearch;
