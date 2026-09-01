/**
 * RoommateProfile.jsx
 *
 * Loads the target user's profile from GET /api/users/:id (real API).
 * Reviews from GET /api/reviews?targetUser=:id (real API).
 * getOrCreateThread is async — properly awaited before navigating.
 * No mock data. No AuthContext.users array lookup.
 */
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useRoommates } from "@shared/hooks/useRoommates";
import { useMessages } from "@shared/hooks/useMessages";
import { apiGetUser, apiListReviews, apiSubmitReview, apiSubmitReport } from "@shared/services/api";
import Avatar from "@shared/components/common/Avatar";
import Rating from "@shared/components/common/Rating";
import Button from "@shared/components/common/Button";
import Modal from "@shared/components/common/Modal";
import Textarea from "@shared/components/common/Textarea";

export const RoommateProfile = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { getCompatibility } = useRoommates();
  const { getOrCreateThread } = useMessages();

  const [user,        setUser]        = useState(null);
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [pageError,   setPageError]   = useState("");
  const [msgLoading,  setMsgLoading]  = useState(false);

  // Leave a review state
  const [reviewOpen,    setReviewOpen]    = useState(false);
  const [reviewRating,  setReviewRating]  = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError,   setReviewError]   = useState("");

  // Report state
  const [reportOpen,    setReportOpen]    = useState(false);
  const [reportReason,  setReportReason]  = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError,   setReportError]   = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [userData, reviewData] = await Promise.all([
          apiGetUser(id),
          apiListReviews({ targetUser: id }),
        ]);
        setUser(userData.user);
        setReviews(reviewData.reviews || []);
      } catch (err) {
        setPageError(err.message || "Profile not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleMessageUser = async () => {
    if (!currentUser) { navigate("/login"); return; }
    setMsgLoading(true);
    const threadId = await getOrCreateThread(id);
    setMsgLoading(false);
    if (threadId) navigate(`/user/messages?thread=${threadId}`);
  };

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) { setReviewError("Please write a comment."); return; }
    setReviewLoading(true);
    setReviewError("");
    try {
      await apiSubmitReview({ rating: reviewRating, comment: reviewComment, target_user: id });
      const data = await apiListReviews({ targetUser: id });
      setReviews(data.reviews || []);
      setReviewOpen(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.message || "Failed to post review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Submit report ─────────────────────────────────────────────────────────
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) { setReportError("Please describe the issue."); return; }
    setReportLoading(true);
    setReportError("");
    try {
      await apiSubmitReport({
        title: "Inappropriate User",
        reason: reportReason,
        reported_user_id: id,
      });
      setReportSuccess(true);
      setReportReason("");
    } catch (err) {
      setReportError(err.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant gap-2">
        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
        Loading profile...
      </div>
    );
  }

  if (pageError || !user) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-error-container/20 border border-error/20 p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-2 font-bold">Profile Not Found</h3>
          <p className="text-body-md text-on-surface-variant mt-2">
            {pageError || "This profile does not exist or has been deactivated."}
          </p>
          <Link to="/user/roommates" className="mt-4 inline-block text-primary font-bold hover:underline">
            Back to roommates
          </Link>
        </div>
      </div>
    );
  }

  const compat   = getCompatibility(user.id);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length
    : 0;

  const budgetDisplay = user.budget_min && user.budget_max
    ? `$${user.budget_min} – $${user.budget_max}/mo`
    : user.budget_min ? `From $${user.budget_min}/mo` : "Not specified";

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      <Link
        to="/user/roommates"
        className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1 w-fit"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Roommates
      </Link>

      {/* Profile header */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={user.profile_image || user.avatar} name={user.name} size="xxl" />
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{user.name}</h1>
                {(user.is_verified || user.isVerified) && (
                  <span className="text-primary" title="Verified Member">
                    <span className="material-symbols-outlined text-[20px] icon-fill">verified</span>
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {user.age ? `${user.age} years old` : ""}
                {user.age && user.gender ? " · " : ""}
                {user.gender || ""}
              </p>
            </div>
            {currentUser?.id !== user.id && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleMessageUser}
                  disabled={msgLoading}
                  className="px-6 py-3"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  {msgLoading ? "Opening..." : "Send Message"}
                </Button>
                <button
                  onClick={() => { setReportOpen(true); setReportError(""); setReportSuccess(false); }}
                  className="flex items-center gap-1 px-4 py-3 border border-outline-variant rounded-lg text-on-surface hover:text-error hover:bg-surface-container transition-colors text-sm font-semibold"
                  title="Report this user"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  Report
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold pt-1">
            {user.university && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                <span>{user.university}</span>
              </div>
            )}
            {user.major && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                <span>{user.major}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              <span>Budget: {budgetDisplay}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Bio, Hobbies, Reviews */}
        <div className="md:col-span-2 space-y-6">

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">About Me</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {user.bio || "This user hasn't written a biography yet."}
            </p>
          </section>

          {user.hobbies?.length > 0 && (
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Hobbies & Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.map((h, i) => (
                  <span key={i} className="bg-surface-container px-3.5 py-1.5 rounded-lg text-body-md text-on-surface font-semibold border border-outline-variant/60">
                    {h}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Roommate Feedback</h2>
              <div className="flex items-center gap-3">
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Rating value={avgRating} />
                    <span className="font-bold text-label-md text-on-surface">({avgRating.toFixed(1)} / 5)</span>
                  </div>
                )}
                {currentUser && currentUser.id !== user.id && (
                  <button
                    onClick={() => { setReviewOpen(true); setReviewError(""); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[17px]">rate_review</span>
                    Write Review
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No reviews for this user yet.</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="border-b border-outline-variant/60 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-on-surface font-bold">{rev.reviewer_name}</span>
                      <Rating value={parseFloat(rev.rating)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2">{rev.comment}</p>
                    <span className="text-[10px] text-outline block mt-1 text-right">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right: Compatibility */}
        <div>
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
            <div className="text-center pb-4 border-b border-outline-variant/60">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                Roommate Match
              </span>
              <p className="font-headline-lg text-headline-lg text-secondary font-bold">
                {compat.compatibilityScore}%
              </p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Lifestyle Compatibility</p>
            </div>

            {compat.breakdown && Object.keys(compat.breakdown).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Preference Alignment</h3>
                {Object.entries(compat.breakdown).map(([key, score]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-on-surface-variant capitalize">
                      <span>
                        {key === "sleepSchedule" ? "Sleep Hours"
                          : key === "hobbiesSharing" ? "Hobbies"
                          : key === "socialLife" ? "Social Habits"
                          : key}
                      </span>
                      <span>{score}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${score >= 80 ? "bg-secondary" : score >= 60 ? "bg-primary" : "bg-outline"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(compat.matchingPreferences.length > 0 || compat.mismatchPreferences.length > 0) && (
              <div className="space-y-2 pt-4 border-t border-outline-variant/60">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">Habit Details</span>
                {compat.matchingPreferences.map((pref, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[16px] icon-fill mt-0.5">check_circle</span>
                    <span>{pref.label}</span>
                  </div>
                ))}
                {compat.mismatchPreferences.map((pref, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-outline font-medium">
                    <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                    <span>{pref.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>

    {/* Review Modal */}
    <Modal
      isOpen={reviewOpen}
      onClose={() => setReviewOpen(false)}
      title={`Review ${user?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={reviewLoading}>Cancel</Button>
            <Button variant="primary" onClick={handleReviewSubmit} disabled={reviewLoading || !reviewComment.trim()}>
              {reviewLoading ? "Posting..." : "Post Review"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {reviewError && (
            <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              {reviewError}
            </div>
          )}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface-variant">Star Rating</label>
            <div className="flex items-center gap-2">
              <Rating value={reviewRating} size="lg" onChange={setReviewRating} />
              <span className="font-bold text-label-md text-on-surface">{reviewRating} Stars</span>
            </div>
          </div>
          <Textarea
            label="Your Review"
            placeholder="Share your experience living with or meeting this person..."
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            rows={4}
            required
          />
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={reportOpen}
        onClose={() => { setReportOpen(false); setReportSuccess(false); setReportReason(""); setReportError(""); }}
        title="Report This User"
        footer={
          reportSuccess ? (
            <Button variant="primary" onClick={() => { setReportOpen(false); setReportSuccess(false); }}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setReportOpen(false)} disabled={reportLoading}>Cancel</Button>
              <Button variant="primary" onClick={handleReportSubmit} disabled={reportLoading || !reportReason.trim()}>
                {reportLoading ? "Submitting..." : "Submit Report"}
              </Button>
            </>
          )
        }
      >
        {reportSuccess ? (
          <div className="text-center py-4 space-y-3">
            <span className="material-symbols-outlined text-[48px] text-secondary icon-fill">check_circle</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Report Submitted</h3>
            <p className="text-body-md text-on-surface-variant">
              Thank you. Our moderation team will review this profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportError && (
              <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                {reportError}
              </div>
            )}
            <p className="text-body-md text-on-surface-variant">
              Reporting: <strong>{user?.name}</strong>
            </p>
            <Textarea
              label="Reason for Reporting"
              placeholder="Describe the issue — e.g. fake profile, harassment, misleading information..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={4}
              required
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default RoommateProfile;
