import React, { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { mockReports } from "@shared/data/mockReports";
import StatusBadge from "@shared/components/common/StatusBadge";
import Button from "@shared/components/common/Button";
import Avatar from "@shared/components/common/Avatar";
import Textarea from "@shared/components/common/Textarea";

export const AdminPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useContext(AuthContext);
  const { properties, verifyProperty, deleteProperty } = useProperties();
  const [moderatorNotes, setModeratorNotes] = useState("");

  const property = properties.find((p) => p.id === id);
  const owner = users.find((u) => u.id === property?.ownerId);
  const propertyReports = mockReports.filter((r) => r.reportedPropertyId === id);
  const ownerListings = properties.filter((p) => p.ownerId === property?.ownerId);

  if (!property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">
          Property Not Found
        </h3>
        <Link to="/admin/properties" className="mt-4 inline-block text-primary font-bold hover:underline">
          Back to Property Queue
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    verifyProperty(property.id);
    alert("Listing approved and marked as verified.");
    navigate("/admin/properties");
  };

  const handleReject = () => {
    deleteProperty(property.id);
    alert("Listing rejected and removed.");
    navigate("/admin/properties");
  };

  return (
    <div className="space-y-section-margin max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            to="/admin/properties"
            className="text-on-surface-variant hover:text-primary flex items-center transition-colors font-label-md text-label-md mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Back to Property Queue
          </Link>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded-full font-label-sm text-label-sm border border-outline-variant">
              ID: {property.id.toUpperCase()}
            </span>
            <StatusBadge status={property.isVerified ? "verified" : "pending"} />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-background">{property.title}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {property.address}, {property.city}
          </p>
        </div>
        {propertyReports.length > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface rounded-lg font-label-md text-label-md bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-sm">flag</span>
            View Reports ({propertyReports.length})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
        <div className="lg:col-span-8 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px]">
              <div className="col-span-4 md:col-span-3 row-span-2 relative rounded-lg overflow-hidden">
                <img alt={property.title} className="w-full h-full object-cover" src={property.images[0]} />
              </div>
              {property.images.slice(1, 3).map((img, i) => (
                <div key={i} className="hidden md:block col-span-1 row-span-1 rounded-lg overflow-hidden">
                  <img alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" src={img} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-6 border-b border-surface-variant pb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">Property Description</h2>
                <div className="flex gap-4 font-body-md text-body-md text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bed</span>
                    {property.bedrooms} Bedrooms
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bathroom</span>
                    {property.bathrooms} Bathrooms
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">home</span>
                    {property.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline-lg text-headline-lg text-primary">
                  ${property.price}
                  <span className="font-body-md text-body-md text-on-surface-variant font-normal">/mo</span>
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  Available: {property.availableFrom}
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface">{property.description}</p>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-primary p-6 sticky top-24">
            <h2 className="font-headline-md text-headline-md text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              Moderation Actions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Review this listing before approving it to the public marketplace.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="secondary" onClick={handleApprove} className="w-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Approve Listing
              </Button>
              <Button variant="danger" onClick={handleReject} className="w-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">cancel</span>
                Reject Listing
              </Button>
            </div>
            <div className="mt-6">
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                Moderator Notes (Internal)
              </label>
              <Textarea
                placeholder="Add notes about your decision..."
                rows={3}
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-4 border-b border-surface-variant pb-2">
              Owner / Lister Details
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={owner?.avatar} name={owner?.name} size="lg" />
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-background">{owner?.name || "Unknown"}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{owner?.email}</p>
              </div>
            </div>
            <div className="space-y-3 font-body-md text-body-md">
              <div className="flex justify-between py-2 border-b border-surface-variant">
                <span className="text-on-surface-variant">Active Listings</span>
                <span className="text-on-background font-medium">{ownerListings.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-on-surface-variant">Verified</span>
                <StatusBadge status={owner?.isVerified ? "verified" : "unverified"} />
              </div>
            </div>
            {owner && (
              <Link
                to={`/admin/users/${owner.id}`}
                className="mt-4 block text-center text-primary font-label-md text-label-md hover:underline"
              >
                View Owner Profile
              </Link>
            )}
          </div>

          {propertyReports.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-4 border-b border-surface-variant pb-2 flex items-center justify-between">
                User Reports
                <span className="bg-error-container text-on-error-container text-xs px-2 py-1 rounded-full font-bold">
                  {propertyReports.length}
                </span>
              </h3>
              <div className="space-y-4">
                {propertyReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-error-container/20 border border-error-container rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-md text-label-md text-on-background">{report.title}</span>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">{report.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetails;
