import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { mockReviews } from "@shared/data/mockReviews";
import Avatar from "@shared/components/common/Avatar";
import Rating from "@shared/components/common/Rating";

export const TenantProfile = () => {
  const { currentUser } = useContext(AuthContext);

  // Get reviews written about this tenant
  const userReviews = mockReviews.filter((r) => r.targetUserId === currentUser?.id);
  const avgRating =
    userReviews.reduce((acc, r) => acc + r.rating, 0) / (userReviews.length || 1);

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="xxl" />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                {currentUser.name}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {currentUser.age} years old &bull; {currentUser.gender}
              </p>
            </div>
            <Link
              to="/user/profile/edit"
              className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-surface-tint transition-all flex items-center justify-center gap-1 select-none"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Edit Profile
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-label-md text-on-surface-variant font-semibold">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span>{currentUser.university || "State University"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
              <span>{currentUser.major || "Computer Science"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              <span>{currentUser.budget || "$800 - $1,200"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Bio & Hobbies */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">About Me</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {currentUser.bio || "No biography provided yet. Write something about yourself to find matches!"}
            </p>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Hobbies & Interests</h2>
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
                <p className="text-body-md text-on-surface-variant">No hobbies added yet.</p>
              )}
            </div>
          </section>

          {/* Past Roommate Reviews */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Roommate Reviews</h2>
              {userReviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Rating value={avgRating} size="sm" />
                  <span className="font-bold text-label-md text-on-surface">
                    ({avgRating.toFixed(1)} / 5)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {userReviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No roommate reviews received yet.</p>
              ) : (
                userReviews.map((rev) => (
                  <div key={rev.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
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
                    <p className="text-body-md text-on-surface-variant mt-3 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right column: Lifestyle preferences */}
        <div className="space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Lifestyle</h2>
              <Link
                to="/user/preferences"
                className="text-primary font-label-sm text-label-sm hover:underline font-semibold"
              >
                Retake Quiz
              </Link>
            </div>
            <div className="space-y-4">
              {Object.entries(currentUser.preferences || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-b-0">
                  <span className="font-body-md text-body-md text-on-surface-variant capitalize">
                    {key === "smoke" ? "Smoking" : key === "pet" ? "Pets" : key === "clean" ? "Cleanliness" : key === "sleep" ? "Schedule" : key === "social" ? "Social Life" : key}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
