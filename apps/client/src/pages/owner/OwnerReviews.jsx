/**
 * OwnerReviews.jsx
 *
 * Lists reviews for all properties owned by the current user.
 * Reads from GET /api/reviews?targetProperty=:id for each property.
 * No mock data. No localStorage.
 */
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { apiListReviews } from "@shared/services/api";
import Rating from "@shared/components/common/Rating";
import Avatar from "@shared/components/common/Avatar";
import EmptyState from "@shared/components/common/EmptyState";

export const OwnerReviews = () => {
  const { currentUser } = useContext(AuthContext);

  // Fetch only this user's properties
  const { properties, loading: propsLoading } = useProperties(
    currentUser?.id ? { ownerId: currentUser.id } : {}
  );

  const [reviews,        setReviews]        = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Once properties are loaded, fetch all their reviews in parallel
  useEffect(() => {
    if (propsLoading || properties.length === 0) return;
    setLoadingReviews(true);
    Promise.all(
      properties.map(p =>
        apiListReviews({ targetProperty: p.id }).then(d => d.reviews || []).catch(() => [])
      )
    )
      .then(results => setReviews(results.flat()))
      .finally(() => setLoadingReviews(false));
  }, [propsLoading, properties.map(p => p.id).join(",")]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length)
    : 0;

  const loading = propsLoading || loadingReviews;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Tenant Reviews</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Ratings and comments left by students who stayed in your properties
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant">
            <span className="text-xs text-outline uppercase font-bold">Average</span>
            <Rating value={avgRating} size="md" />
            <span className="font-bold text-label-md text-on-surface">
              ({avgRating.toFixed(1)})
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-on-surface-variant gap-2">
          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="rate_review"
          title="No reviews yet"
          description="Your properties haven't received any tenant reviews yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map(rev => {
            const prop = properties.find(p => p.id === rev.target_property);
            return (
              <div
                key={rev.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={rev.reviewer_image} name={rev.reviewer_name} size="sm" />
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewer_name}
                      </h4>
                      <span className="text-xs text-primary font-semibold">
                        Property: {prop?.title || rev.property_title || "Rental Unit"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Rating value={parseFloat(rev.rating)} />
                    <span className="text-[10px] text-outline block">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-body-md text-on-surface-variant leading-relaxed pl-3 border-l-2 border-outline-variant italic">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;
