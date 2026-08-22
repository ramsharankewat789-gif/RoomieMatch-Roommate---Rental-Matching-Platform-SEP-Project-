import React, { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useRoommates } from "@shared/hooks/useRoommates";
import { useMessages } from "@shared/hooks/useMessages";
import { mockReviews } from "@shared/data/mockReviews";
import Avatar from "@shared/components/common/Avatar";
import Rating from "@shared/components/common/Rating";
import Button from "@shared/components/common/Button";

export const RoommateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useContext(AuthContext);
  const { getCompatibility } = useRoommates();
  const { getOrCreateThread } = useMessages();

  const user = users.find((u) => u.id === id);

  if (!user || user.role !== "tenant") {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-error-container/20 border border-error/20 p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-2 font-bold">Profile Not Found</h3>
          <p className="text-body-md text-on-surface-variant mt-2">
            The student profile you are trying to view does not exist or has been deactivated.
          </p>
          <Link to="/user/roommates" className="mt-4 inline-block text-primary font-bold hover:underline">
            Back to roommates
          </Link>
        </div>
      </div>
    );
  }

  const compat = getCompatibility(user.id);
  const userReviews = mockReviews.filter((r) => r.targetUserId === user.id);
  const avgRating =
    userReviews.reduce((acc, r) => acc + r.rating, 0) / (userReviews.length || 1);

  const handleMessageUser = () => {
    const threadId = getOrCreateThread(user.id);
    navigate(`/user/messages?thread=${threadId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/user/roommates"
          className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1 w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Roommates
        </Link>
      </div>

      {/* Main card */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={user.avatar} name={user.name} size="xxl" />
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {user.name}
                </h1>
                {user.isVerified && (
                  <span className="text-primary" title="Verified Student">
                    <span className="material-symbols-outlined text-[20px] icon-fill">verified</span>
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {user.age} years old &bull; {user.gender}
              </p>
            </div>
            
            <Button variant="primary" onClick={handleMessageUser} className="px-6 py-3">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Send Message
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold pt-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span>{user.university || "State University"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
              <span>{user.major || "Computer Science"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              <span>Budget: {user.budget || "$800 - $1,200"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Double Column details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side (Col Span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">About Me</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {user.bio || "This roommate hasn't written a biography yet."}
            </p>
          </section>

          {/* Hobbies */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Hobbies & Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.hobbies && user.hobbies.length > 0 ? (
                user.hobbies.map((h, i) => (
                  <span
                    key={i}
                    className="bg-surface-container px-3.5 py-1.5 rounded-lg text-body-md text-on-surface font-semibold border border-outline-variant/60"
                  >
                    {h}
                  </span>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">No hobbies added yet.</p>
              )}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Roommate Feedback</h2>
              {userReviews.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Rating value={avgRating} />
                  <span className="font-bold text-label-md text-on-surface">
                    ({avgRating.toFixed(1)} / 5)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {userReviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No reviews written for this student yet.</p>
              ) : (
                userReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-outline-variant/60 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {rev.reviewerName}
                      </span>
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

        {/* Right Side: Compatibility Breakdown */}
        <div className="space-y-6">
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

            {/* Metric Bars */}
            <div className="space-y-4">
              <h3 className="font-label-md text-label-md text-on-surface font-bold mb-3">Preference Alignment</h3>
              {Object.entries(compat.breakdown || {}).map(([key, score]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant capitalize">
                    <span>{key === "sleepSchedule" ? "Sleep Hours" : key === "hobbiesSharing" ? "Hobbies" : key === "socialLife" ? "Social Habits" : key}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? "bg-secondary" : score >= 60 ? "bg-primary" : "bg-outline"
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* List Matching Habits */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/60">
              <span className="text-[11px] font-bold text-outline-variant uppercase tracking-wider block">
                Habit Details
              </span>
              
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default RoommateProfile;
