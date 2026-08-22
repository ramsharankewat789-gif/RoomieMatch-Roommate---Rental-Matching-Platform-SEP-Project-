import React, { useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProperties } from "@shared/hooks/useProperties";
import { useApplications } from "@shared/hooks/useApplications";
import { useMessages } from "@shared/hooks/useMessages";
import { AuthContext } from "@shared/context/AuthContext";
import { mockReviews } from "@shared/data/mockReviews";
import Avatar from "@shared/components/common/Avatar";
import Rating from "@shared/components/common/Rating";
import Button from "@shared/components/common/Button";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { applyForProperty } = useApplications();
  const { getOrCreateThread } = useMessages();
  const { currentUser, users, updateProfile } = useContext(AuthContext);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [appMessage, setAppMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-error-container/20 border border-error/20 p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-2 font-bold">Property Not Found</h3>
          <p className="text-body-md text-on-surface-variant mt-2">
            The property listing you are trying to view does not exist or has been removed.
          </p>
          <Link to="/user/properties" className="mt-4 inline-block text-primary font-bold hover:underline">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const landlord = users.find((u) => u.id === property.ownerId);

  // Reviews for this property
  const propReviews = mockReviews.filter((r) => r.propertyId === property.id);
  const avgRating =
    propReviews.reduce((acc, r) => acc + r.rating, 0) / (propReviews.length || 1);

  const isFavorite = () => {
    return (currentUser?.favorites || []).includes(property.id);
  };

  const handleFavoriteToggle = () => {
    if (!currentUser) return;
    const favs = currentUser.favorites || [];
    let newFavs;
    if (favs.includes(property.id)) {
      newFavs = favs.filter((fid) => fid !== property.id);
    } else {
      newFavs = [...favs, property.id];
    }
    updateProfile({ favorites: newFavs });
  };

  const handleMessageOwner = () => {
    if (!currentUser) return;
    const threadId = getOrCreateThread(property.ownerId, property.id);
    navigate(`/user/messages?thread=${threadId}`);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);

    setTimeout(() => {
      const result = applyForProperty(
        currentUser.id,
        currentUser.name,
        property.id,
        property.title,
        property.ownerId,
        appMessage
      );

      setLoading(false);
      setIsApplyModalOpen(false);

      if (result.success) {
        alert("Application submitted successfully!");
        navigate("/user/applications");
      } else {
        alert(result.message);
      }
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs / Back button */}
      <div>
        <Link
          to="/user/properties"
          className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1 w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Listings
        </Link>
      </div>

      {/* Header Info */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-surface-container-high px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant border border-outline-variant">
              {property.type}
            </span>
            {property.isVerified && (
              <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm border border-secondary flex items-center gap-0.5 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm icon-fill">verified</span>
                Verified
              </span>
            )}
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            {property.title}
          </h1>
          <p className="text-body-lg text-body-lg text-on-surface-variant font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
            {property.address}, {property.city}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-end gap-3 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <p className="font-headline-lg text-headline-lg text-primary font-bold">
              ${property.price}
            </p>
            <p className="text-xs text-outline font-semibold">/month + ${property.deposit} deposit</p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className="flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:text-error hover:bg-surface-container transition-colors shadow-sm select-none"
          >
            <span className={`material-symbols-outlined text-[20px] ${isFavorite() ? "text-error icon-fill" : ""}`}>
              favorite
            </span>
            <span>{isFavorite() ? "Favorited" : "Favorite"}</span>
          </button>
        </div>
      </section>

      {/* Media Gallery */}
      <section className="grid grid-cols-1 md:grid-cols-1 gap-2 rounded-xl overflow-hidden shadow-sm border border-outline-variant max-h-[420px] bg-surface-container">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover max-h-[420px]"
        />
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Description</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </section>

          {/* Amenities & Features */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-body-md text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-secondary icon-fill">check_circle</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* House Rules */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">House Rules</h2>
            <ul className="space-y-3">
              {property.rules && property.rules.length > 0 ? (
                property.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">info</span>
                    <span>{rule}</span>
                  </li>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">No rules specified. Please ask the owner.</p>
              )}
            </ul>
          </section>

          {/* Reviews section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Property Reviews</h2>
              {propReviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Rating value={avgRating} />
                  <span className="font-bold text-label-md text-on-surface">
                    ({avgRating.toFixed(1)} / 5)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {propReviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No reviews written for this property yet.</p>
              ) : (
                propReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-outline-variant/60 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={rev.reviewerAvatar} name={rev.reviewerName} size="sm" />
                        <div>
                          <h4 className="font-label-md text-label-md text-on-surface font-bold">
                            {rev.reviewerName}
                          </h4>
                          <span className="text-xs text-outline">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Rating value={rev.rating} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Side (Col Span 1) */}
        <div className="space-y-6">
          
          {/* Owner/Landlord Card */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm text-center">
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider font-semibold mb-4">
              Property Owner
            </h3>
            
            <div className="flex flex-col items-center gap-3 mb-6">
              <Avatar src={landlord?.avatar} name={landlord?.name || "Landlord"} size="xl" />
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {landlord?.name || "Sarah Jenkins"}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {landlord?.company || "Verified Landlord"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleMessageOwner}
                className="w-full border border-outline text-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Message Owner
              </button>
              
              <Button
                variant="primary"
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full py-3"
              >
                Apply Now
              </Button>
            </div>
          </section>

          {/* Quick Specifications */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">
              Details
            </h3>
            <div className="space-y-3 font-body-md text-body-md text-on-surface-variant">
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span>Available From</span>
                <span className="font-bold text-on-surface">{property.availableFrom}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span>Bedrooms</span>
                <span className="font-bold text-on-surface">{property.bedrooms} Bed</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span>Bathrooms</span>
                <span className="font-bold text-on-surface">{property.bathrooms} Bath</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Rent Term</span>
                <span className="font-bold text-on-surface">1 Year Lease</span>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Housing Application"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplySubmit} disabled={loading}>
              {loading ? "Submitting..." : "Send Application"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-body-md text-on-surface-variant">
            You are applying for <strong>{property.title}</strong> at <strong>${property.price}/month</strong>. Your verified student profile will be shared with the landlord (<strong>{landlord?.name}</strong>).
          </p>
          
          <Textarea
            label="Introduce Yourself"
            placeholder="Write a friendly note to the owner introducing yourself, explaining your major, year, and why you are interested in this rental..."
            value={appMessage}
            onChange={(e) => setAppMessage(e.target.value)}
            rows={5}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
