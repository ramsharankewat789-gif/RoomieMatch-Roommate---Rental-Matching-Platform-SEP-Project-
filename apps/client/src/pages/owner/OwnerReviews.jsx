import React, { useContext } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { mockReviews } from "@shared/data/mockReviews";
import Rating from "@shared/components/common/Rating";
import Avatar from "@shared/components/common/Avatar";
import EmptyState from "@shared/components/common/EmptyState";

export const OwnerReviews = () => {
  const { currentUser } = useContext(AuthContext);
  const { properties } = useProperties();

  const myProperties = properties.filter((p) => p.ownerId === currentUser?.id);
  const myPropIds = myProperties.map((p) => p.id);

  // Reviews for landlord's properties
  const receivedReviews = mockReviews.filter((r) => myPropIds.includes(r.propertyId));
  const avgRating =
    receivedReviews.reduce((acc, r) => acc + r.rating, 0) / (receivedReviews.length || 1);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Tenant Reviews</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Read ratings and comments left by students who stayed in your properties
          </p>
        </div>
        {receivedReviews.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant">
            <span className="text-xs text-outline uppercase font-bold">Average Rating</span>
            <Rating value={avgRating} size="md" />
            <span className="font-bold text-label-md text-on-surface">({avgRating.toFixed(1)})</span>
          </div>
        )}
      </div>

      {receivedReviews.length === 0 ? (
        <EmptyState
          icon="rate_review"
          title="No reviews yet"
          description="Your properties haven't received any reviews from tenants yet."
        />
      ) : (
        <div className="space-y-4">
          {receivedReviews.map((rev) => {
            const property = myProperties.find((p) => p.id === rev.propertyId);
            return (
              <div
                key={rev.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={rev.reviewerAvatar} name={rev.reviewerName} size="sm" />
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewerName}
                      </h4>
                      <span className="text-xs text-primary font-semibold">
                        Property: {property?.title || "Rental Unit"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Rating value={rev.rating} />
                    <span className="text-[10px] text-outline block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-body-md text-on-surface-variant leading-relaxed pl-3 border-l-2 border-outline-variant">
                  "{rev.comment}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;
