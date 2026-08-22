import React, { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { useApplications } from "@shared/hooks/useApplications";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";

export const OwnerPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { properties, editProperty, deleteProperty } = useProperties();
  const { applications } = useApplications();

  const property = properties.find((p) => p.id === id && p.ownerId === currentUser?.id);
  const pendingApps = applications.filter(
    (a) => a.propertyId === id && a.ownerId === currentUser?.id && a.status === "pending"
  );

  if (!property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">
          Property Not Found
        </h3>
        <Link to="/user/my-properties" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to My Properties
        </Link>
      </div>
    );
  }

  const handleToggleAvailability = () => {
    const newStatus = property.status === "active" ? "inactive" : "active";
    editProperty(property.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      deleteProperty(property.id);
      navigate("/user/my-properties");
    }
  };

  return (
    <div className="space-y-section-margin max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            to="/user/my-properties"
            className="text-on-surface-variant hover:text-primary flex items-center gap-1 font-label-md text-label-md mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to My Listings
          </Link>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
            <span className="material-symbols-outlined text-lg">location_on</span>
            {property.address}, {property.city}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={property.isVerified ? "verified" : "unverified"} />
          <StatusBadge status={property.status} />
          <Link
            to={`/user/my-properties/${property.id}/edit`}
            className="flex items-center gap-2 border border-outline text-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors bg-surface-container-lowest shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Listing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
        <div className="lg:col-span-8 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="relative h-[300px] md:h-[400px] w-full">
              <img alt={property.title} className="w-full h-full object-cover" src={property.images[0]} />
              <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-outline-variant flex items-center gap-3">
                <span className="font-label-md text-label-md text-on-surface">
                  {property.status === "active" ? "Currently Available" : "Not Available"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={property.status === "active"}
                    onChange={handleToggleAvailability}
                  />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
            <div className="p-6 flex justify-between items-center bg-surface-container-lowest">
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary mb-1">bed</span>
                  <span className="font-label-md text-label-md">{property.bedrooms} Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary mb-1">bathtub</span>
                  <span className="font-label-md text-label-md">{property.bathrooms} Bath</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary mb-1">home</span>
                  <span className="font-label-md text-label-md">{property.type}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline-lg text-headline-lg text-primary block">${property.price}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">per month</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Property Description</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{property.description}</p>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">folder_shared</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Applications</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {pendingApps.length} Pending Review
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/user/my-properties/applications")} className="w-full flex items-center justify-center gap-2">
              View Applications
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Button>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Listing Management</h3>
            <Button variant="danger" onClick={handleDelete} className="w-full">
              Delete Listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerPropertyDetails;
