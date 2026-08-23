/**
 * Reviews.jsx (Tenant / User)
 *
 * Reads reviews from GET /api/reviews (real MySQL backend).
 * Submits new reviews via POST /api/reviews.
 * No mock data. No localStorage.
 */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { apiListReviews, apiSubmitReview, apiListUsers } from "@shared/services/api";
import Rating from "@shared/components/common/Rating";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";

export const Reviews = () => {
  const { currentUser } = useContext(AuthContext);

  // Reviews about the current user (received)
  const [receivedReviews, setReceivedReviews] = useState([]);
  // Reviews written by the current user
  const [writtenReviews,  setWrittenReviews]  = useState([]);
  const [loadingReviews,  setLoadingReviews]  = useState(true);

  // Write-review form
  const [type,       setType]       = useState("property");
  const [targetId,   setTargetId]   = useState("");
  const [rating,     setRating]     = useState(5);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  // Property and user options for the target selector
  const { properties }  = useProperties();
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    apiListUsers({ role: "user", limit: 100 })
      .then(d => setAllUsers((d.users || []).filter(u => u.id !== currentUser?.id)))
      .catch(() => {});
  }, [currentUser?.id]);

  const loadReviews = useCallback(async () => {
    if (!currentUser) return;
    setLoadingReviews(true);
    try {
      const [received, written] = await Promise.all([
        apiListReviews({ targetUser: currentUser.id }),
        apiListReviews({ reviewerId: currentUser.id }),
      ]);
      setReceivedReviews(received.reviews || []);
      setWrittenReviews(written.reviews  || []);
    } catch {
      // silent
    } finally {
      setLoadingReviews(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId || !comment.trim()) {
      setSubmitErr("Please select a target and write a comment.");
      return;
    }
    setSubmitting(true);
    setSubmitErr("");
    try {
      await apiSubmitReview({
        rating,
        comment,
        target_property: type === "property" ? targetId : undefined,
        target_user:     type === "roommate"  ? targetId : undefined,
      });
      setComment("");
      setTargetId("");
      setRating(5);
      await loadReviews();
    } catch (err) {
      setSubmitErr(err.message || "Failed to post review.");
    } finally {
      setSubmitting(false);
    }
  };

  const targetOptions = [
    { value: "", label: "-- Select --" },
    ...(type === "property"
      ? properties.map(p => ({ value: p.id, label: p.title }))
      : allUsers.map(u => ({ value: u.id, label: u.name }))),
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Reviews Center</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Read reviews written about you, see reviews you published, or write new feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Received + Written */}
        <div className="lg:col-span-2 space-y-6">

          {/* Reviews Received */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Reviews Received</h2>
            {loadingReviews ? (
              <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Loading...
              </p>
            ) : receivedReviews.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No reviews written about you yet.</p>
            ) : (
              <div className="space-y-4">
                {receivedReviews.map(rev => (
                  <div key={rev.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewer_name}
                      </span>
                      <Rating value={parseFloat(rev.rating)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-outline block mt-2 text-right">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews Written */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Reviews You Published</h2>
            {loadingReviews ? (
              <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Loading...
              </p>
            ) : writtenReviews.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">You haven't written any reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {writtenReviews.map(rev => (
                  <div key={rev.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-primary font-bold">
                        Reviewed: {rev.property_title || "Roommate"}
                      </span>
                      <Rating value={parseFloat(rev.rating)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2">{rev.comment}</p>
                    <span className="text-[10px] text-outline block mt-2 text-right">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Write a Review */}
        <div>
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Publish Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitErr && (
                <p className="text-xs text-error font-semibold">{submitErr}</p>
              )}
              <Select
                label="Review Type"
                value={type}
                onChange={e => { setType(e.target.value); setTargetId(""); }}
                options={[
                  { value: "property", label: "Property / Landlord" },
                  { value: "roommate", label: "Roommate / Tenant" },
                ]}
              />
              <Select
                label="Choose Subject"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                options={targetOptions}
                required
              />
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">
                  Star Rating
                </label>
                <div className="flex items-center gap-2">
                  <Rating value={rating} size="lg" onChange={setRating} />
                  <span className="font-bold text-label-md text-on-surface">{rating} Stars</span>
                </div>
              </div>
              <Textarea
                label="Review Comments"
                placeholder="Share your experience honestly..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                required
              />
              <Button type="submit" variant="primary" className="w-full py-3" disabled={submitting}>
                {submitting ? "Posting..." : "Post Review"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
