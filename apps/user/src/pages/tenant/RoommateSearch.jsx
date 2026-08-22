import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoommates } from "@shared/hooks/useRoommates";
import { useMessages } from "@shared/hooks/useMessages";
import Avatar from "@shared/components/common/Avatar";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import EmptyState from "@shared/components/common/EmptyState";

export const RoommateSearch = () => {
  const { candidates, getCompatibility } = useRoommates();
  const { getOrCreateThread } = useMessages();
  const navigate = useNavigate();

  // Filter States
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [minScore, setMinScore] = useState("");
  const [major, setMajor] = useState("");

  // Enrich roommates with compatibility scores
  const roommates = candidates.map(c => {
    return {
      ...c,
      compat: getCompatibility(c.id)
    };
  }).sort((a, b) => b.compat.compatibilityScore - a.compat.compatibilityScore);

  const handleChat = (roommateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const threadId = getOrCreateThread(roommateId);
    navigate(`/user/messages?thread=${threadId}`);
  };

  // Filter logic
  const filteredRoommates = roommates.filter((item) => {
    // Search by Name or Major or Bio
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        (item.major && item.major.toLowerCase().includes(q)) ||
        (item.bio && item.bio.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Gender
    if (gender && item.gender !== gender) {
      return false;
    }

    // Major query
    if (major && !item.major.toLowerCase().includes(major.toLowerCase())) {
      return false;
    }

    // Min compatibility
    if (minScore && item.compat.compatibilityScore < Number(minScore)) {
      return false;
    }

    return true;
  });

  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Non-binary", label: "Non-binary" }
  ];

  const scoreOptions = [
    { value: "", label: "Any Compatibility" },
    { value: "70", label: "70%+ Compatible" },
    { value: "80", label: "80%+ Compatible" },
    { value: "90", label: "90%+ Compatible" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Find Compatible Roommates</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Connect with students sharing similar habits, schedules, and cleanliness guidelines
        </p>
      </div>

      {/* Filter Section */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search name, major, bio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
        />
        <Input
          placeholder="Filter by Major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          icon="school"
        />
        <Select
          options={genderOptions}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        <Select
          options={scoreOptions}
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
        />
      </section>

      {/* Roommates Grid */}
      {filteredRoommates.length === 0 ? (
        <EmptyState
          icon="group"
          title="No roommates found"
          description="Try broadening your compatibility filters or keyword search."
          actionText="Reset All Filters"
          onActionClick={() => {
            setSearch("");
            setGender("");
            setMinScore("");
            setMajor("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRoommates.map((item) => (
            <Link
              key={item.id}
              to={`/tenant/roommates/${item.id}`}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              {/* Score Badge */}
              <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm border border-secondary font-bold">
                {item.compat.compatibilityScore}% MATCH
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar src={item.avatar} name={item.name} size="lg" />
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      {item.age} y/o &bull; {item.gender}
                    </p>
                    <p className="text-xs text-outline font-semibold mt-1">
                      {item.major}
                    </p>
                  </div>
                </div>

                <p className="text-body-md text-on-surface-variant line-clamp-3 leading-relaxed mt-2 italic">
                  "{item.bio || 'No biography added yet.'}"
                </p>

                {/* Overlapping Preferences Summary */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-outline-variant/60">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                    Shared Habits
                  </span>
                  {item.compat.matchingPreferences.slice(0, 2).map((pref, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[14px] icon-fill">check_circle</span>
                      <span>{pref.label}</span>
                    </div>
                  ))}
                  {item.compat.mismatchPreferences.slice(0, 1).map((pref, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-outline-variant font-medium">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span className="truncate">{pref.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/60 flex justify-between items-center">
                <span className="text-xs text-outline font-semibold">
                  Budget: {item.budget}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleChat(item.id, e)}
                    className="bg-primary text-on-primary font-label-sm text-label-sm px-3.5 py-1.5 rounded-lg hover:bg-surface-tint transition-colors flex items-center gap-1 font-semibold select-none"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Chat
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoommateSearch;
