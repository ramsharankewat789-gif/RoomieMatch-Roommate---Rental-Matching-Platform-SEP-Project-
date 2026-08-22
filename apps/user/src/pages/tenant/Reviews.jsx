import React, { useContext, useState } from "react";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import { mockReviews } from "@shared/data/mockReviews";
import Rating from "@shared/components/common/Rating";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";

export const Reviews = () => {
  const { currentUser, users } = useContext(AuthContext);
  const { properties } = useProperties();
  const [reviewsList, setReviewsList] = useState(() => {
    const saved = localStorage.getItem("roomiematch_reviews");
    return saved ? JSON.parse(saved) : mockReviews;
  });

  // New review form state
  const [type, setType] = useState("property"); // property or roommate
  const [targetId, setTargetId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const saveReviews = (newList) => {
    setReviewsList(newList);
    localStorage.setItem("roomiematch_reviews", JSON.stringify(newList));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetId || !comment.trim()) {
      alert("Please select a target and write a comment.");
      return;
    }

    const newReview = {
      id: "rev_" + Date.now(),
      reviewerName: currentUser?.name || "Anonymous Student",
      reviewerAvatar: currentUser?.avatar || "",
      rating: Number(rating),
      comment: comment,
      createdAt: new Date().toISOString()
    };

    if (type === "property") {
      newReview.propertyId = targetId;
      newReview.targetUserId = null;
    } else {
      newReview.propertyId = null;
      newReview.targetUserId = targetId;
    }

    saveReviews([newReview, ...reviewsList]);
    setComment("");
    setTargetId("");
    alert("Thank you! Your review has been posted.");
  };

  // Filter reviews
  const receivedReviews = reviewsList.filter((r) => r.targetUserId === currentUser?.id);
  const writtenReviews = reviewsList.filter((r) => r.reviewerName === currentUser?.name);

  // Targets options
  const propertiesOptions = properties.map((p) => ({ value: p.id, label: p.title }));
  const roommateOptions = users
    .filter((u) => u.role === "tenant" && u.id !== currentUser?.id)
    .map((u) => ({ value: u.id, label: u.name }));

  const targetOptions = [
    { value: "", label: "-- Select Target --" },
    ...(type === "property" ? propertiesOptions : roommateOptions)
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
        
        {/* Left Side: Written and Received Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reviews Received */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Reviews Received</h2>
            <div className="space-y-4">
              {receivedReviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No reviews written about you yet.</p>
              ) : (
                receivedReviews.map((rev) => (
                  <div key={rev.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewerName}
                      </span>
                      <Rating value={rev.rating} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2 italic">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-outline block mt-2 text-right">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Reviews Published */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Reviews You Published</h2>
            <div className="space-y-4">
              {writtenReviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">You haven't written any reviews yet.</p>
              ) : (
                writtenReviews.map((rev) => {
                  const targetName = rev.propertyId
                    ? properties.find((p) => p.id === rev.propertyId)?.title || "Property"
                    : users.find((u) => u.id === rev.targetUserId)?.name || "Roommate";
                  return (
                    <div key={rev.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-label-md text-primary font-bold">
                          Reviewed: {targetName}
                        </span>
                        <Rating value={rev.rating} />
                      </div>
                      <p className="text-body-md text-on-surface-variant mt-2">
                        {rev.comment}
                      </p>
                      <span className="text-[10px] text-outline block mt-2 text-right">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Write a Review Form */}
        <div className="space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Publish Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <Select
                label="Review Type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setTargetId("");
                }}
                options={[
                  { value: "property", label: "Property / Landlord" },
                  { value: "roommate", label: "Roommate / Tenant" }
                ]}
              />

              <Select
                label="Choose Subject"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                options={targetOptions}
                required
              />

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Rating Star Score
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
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />

              <Button type="submit" variant="primary" className="w-full py-3">
                Post Review
              </Button>
            </form>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Reviews;
