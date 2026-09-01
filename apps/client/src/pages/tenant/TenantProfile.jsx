/**
 * TenantProfile.jsx
 *
 * Displays the current user's profile from AuthContext (real MySQL data).
 * Profile image upload/remove calls real API.
 * Reviews received shown from GET /api/reviews?targetUser=:id.
 * Shows a profile-completion reminder until all verification requirements
 * are met (age ≥ 18, profile image, name, city — once per session).
 */
import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { formatCurrency } from "@shared/utils/currency";
import Avatar from "@shared/components/common/Avatar";
import Rating from "@shared/components/common/Rating";
import {
  apiUploadProfileImage,
  apiDeleteProfileImage,
  apiListReviews,
} from "@shared/services/api";

// ── What counts as "complete" for verification eligibility ────────────────
function getMissingFields(user) {
  const missing = [];
  if (!user?.age || user.age < 18) {
    missing.push(
      user?.age
        ? `Age must be 18+ (currently ${user.age})`
        : "Age (must be 18 or older)",
    );
  }
  if (!user?.avatar && !user?.profile_image) missing.push("Profile photo");
  if (!user?.name?.trim()) missing.push("Full name");
  if (!user?.city?.trim()) missing.push("City");
  return missing;
}

const SESSION_KEY = "rm_profile_reminder_dismissed";

export const TenantProfile = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState("");

  // ── Profile completion reminder ───────────────────────────────────────
  const [reminderDismissed, setReminderDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const missingFields = getMissingFields(currentUser);
  const profileComplete = missingFields.length === 0;
  useEffect(() => {
    if (profileComplete) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setReminderDismissed(true);
    }
  }, [profileComplete]);
  const handleDismissReminder = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setReminderDismissed(true);
  };

  // Reviews received by this user
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!currentUser?.id) return;
    setReviewsLoading(true);
    try {
      const data = await apiListReviews({ targetUser: currentUser.id });
      setReviews(data.reviews || []);
    } catch {
      // silent — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  if (!currentUser) return null;

  // Format budget from integers
  const budgetDisplay =
    currentUser.budget_min && currentUser.budget_max
      ? `${formatCurrency(currentUser.budget_min)} – ${formatCurrency(currentUser.budget_max)}/mo`
      : currentUser.budget_min
        ? `From ${formatCurrency(currentUser.budget_min)}/mo`
        : "Not specified";

  // ── Profile image handlers ─────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowed.includes(ext)) {
      setImgError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImgError("Image must be under 5 MB.");
      return;
    }
    setImgLoading(true);
    setImgError("");
    try {
      const data = await apiUploadProfileImage(file);
      updateProfile({ avatar: `http://localhost:4000${data.imageUrl}` });
    } catch (err) {
      setImgError(err.message || "Upload failed.");
    } finally {
      setImgLoading(false);
      e.target.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    setImgLoading(true);
    setImgError("");
    try {
      await apiDeleteProfileImage();
      updateProfile({ avatar: null });
    } catch (err) {
      setImgError(err.message || "Remove failed.");
    } finally {
      setImgLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Profile Completion Reminder ─────────────────────────────── */}
      {!reminderDismissed && !profileComplete && !currentUser.isVerified && (
        <div className="bg-primary-container/20 border border-primary/30 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                Complete your profile to become eligible for verification
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5 mb-2">
                An admin can only verify your account once all of the following
                are provided:
              </p>
              <ul className="space-y-0.5">
                {missingFields.map((f, i) => (
                  <li
                    key={i}
                    className="text-xs text-error font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      cancel
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/user/profile/edit"
                className="inline-flex items-center gap-1 mt-3 text-xs text-primary font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">
                  edit
                </span>
                Complete profile now
              </Link>
            </div>
          </div>
          <button
            onClick={handleDismissReminder}
            className="text-outline hover:text-on-surface transition-colors shrink-0 mt-0.5"
            title="Dismiss for this session"
            aria-label="Dismiss reminder"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Clickable avatar */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            className="relative group cursor-pointer"
            onClick={() => !imgLoading && fileInputRef.current?.click()}
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xxl"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {imgLoading ? (
                <span className="material-symbols-outlined text-white text-[24px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-white text-[24px]">
                  add_a_photo
                </span>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={imgLoading}
              className="text-[10px] font-bold text-primary hover:text-surface-tint transition-colors disabled:opacity-50"
            >
              {currentUser.avatar ? "Change" : "Add photo"}
            </button>
            {currentUser.avatar && (
              <>
                <span className="text-[10px] text-outline">·</span>
                <button
                  onClick={handleAvatarRemove}
                  disabled={imgLoading}
                  className="text-[10px] font-bold text-error hover:text-error/70 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </>
            )}
          </div>
          {imgError && (
            <p className="text-[10px] text-error font-semibold text-center max-w-[96px]">
              {imgError}
            </p>
          )}
          <p className="text-[9px] text-outline text-center leading-tight max-w-[96px]">
            Profile photo only — not ID verification
          </p>
        </div>

        {/* Name + meta */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                {currentUser.name}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {currentUser.age
                  ? `${currentUser.age} years old`
                  : "Age not set"}
                {currentUser.gender ? ` · ${currentUser.gender}` : ""}
              </p>
              {/* Verification badge */}
              <div className="mt-2">
                {currentUser.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary">
                    <span className="material-symbols-outlined text-[14px] icon-fill">
                      verified
                    </span>
                    Verified Member
                  </span>
                ) : (
                  <Link
                    to="/user/verification"
                    className="inline-flex items-center gap-1 text-xs font-bold text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      verified_user
                    </span>
                    Get verified
                  </Link>
                )}
              </div>
            </div>
            <Link
              to="/user/profile/edit"
              className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-surface-tint transition-all flex items-center justify-center gap-1 select-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
              Edit Profile
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold">
            {currentUser.university && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  school
                </span>
                <span>{currentUser.university}</span>
              </div>
            )}
            {currentUser.major && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  menu_book
                </span>
                <span>{currentUser.major}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">
                payments
              </span>
              <span>{budgetDisplay}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Bio & Hobbies */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
              About Me
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {currentUser.bio ||
                "No biography provided yet. Click Edit Profile to add one."}
            </p>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
              Hobbies & Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.hobbies && currentUser.hobbies.length > 0 ? (
                currentUser.hobbies.map((hobby, idx) => (
                  <span
                    key={idx}
                    className="bg-surface-container px-3 py-1.5 rounded-lg text-body-md text-on-surface font-medium border border-outline-variant/60"
                  >
                    {hobby}
                  </span>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">
                  No hobbies added yet.{" "}
                  <Link
                    to="/user/profile/edit"
                    className="text-primary font-semibold hover:underline"
                  >
                    Add some →
                  </Link>
                </p>
              )}
            </div>
          </section>

          {/* Contact info */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
              Contact
            </h2>
            <div className="space-y-3 text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[18px]">
                  mail
                </span>
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    phone
                  </span>
                  <span>{currentUser.phone}</span>
                </div>
              )}
            </div>
          </section>

          {/* Reviews received */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Reviews Received
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Rating
                    value={parseFloat(
                      (
                        reviews.reduce((s, r) => s + parseFloat(r.rating), 0) /
                        reviews.length
                      ).toFixed(1),
                    )}
                  />
                  <span className="font-bold text-label-md text-on-surface text-sm">
                    (
                    {(
                      reviews.reduce((s, r) => s + parseFloat(r.rating), 0) /
                      reviews.length
                    ).toFixed(1)}{" "}
                    / 5)
                  </span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">
                No reviews received yet.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-outline-variant/60 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewer_name}
                      </span>
                      <Rating value={parseFloat(rev.rating)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-2 italic">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-outline block mt-1 text-right">
                      {rev.created_at
                        ? new Date(rev.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-outline-variant/60">
              <Link
                to="/user/reviews"
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Write a review
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right: Lifestyle preferences */}
        <div className="space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Lifestyle
              </h2>
              <Link
                to="/user/preferences"
                className="text-primary font-label-sm text-label-sm hover:underline font-semibold"
              >
                Retake Quiz
              </Link>
            </div>
            {currentUser.preferences &&
            Object.keys(currentUser.preferences).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(currentUser.preferences).map(([key, val]) => {
                  if (!val) return null;
                  const labels = {
                    smoke: "Smoking",
                    pet: "Pets",
                    clean: "Cleanliness",
                    sleep: "Schedule",
                    social: "Social Life",
                    cooking: "Cooking",
                  };
                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b border-outline-variant last:border-b-0"
                    >
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        {labels[key] || key}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-body-md text-on-surface-variant mb-3">
                  No preferences set yet.
                </p>
                <Link
                  to="/user/preferences"
                  className="text-primary font-semibold text-sm hover:underline"
                >
                  Take the lifestyle quiz →
                </Link>
              </div>
            )}
          </section>

          {/* Verification status card */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
              Verification
            </h2>
            <div className="text-center">
              {currentUser.isVerified ? (
                <>
                  <span className="material-symbols-outlined text-[40px] text-secondary icon-fill">
                    verified
                  </span>
                  <p className="font-label-md text-label-md text-secondary font-bold mt-2">
                    Identity Verified
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Full access to roommate search and rentals.
                  </p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[40px] text-outline">
                    verified_user
                  </span>
                  <p className="font-label-md text-label-md text-on-surface font-bold mt-2">
                    Not Verified
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 mb-3">
                    Verify your student identity to unlock all features.
                  </p>
                  <Link
                    to="/user/verification"
                    className="inline-block bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-surface-tint transition-all"
                  >
                    Verify Now
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
