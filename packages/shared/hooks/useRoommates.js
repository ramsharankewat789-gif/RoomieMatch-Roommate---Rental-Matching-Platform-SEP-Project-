import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { mockRoommates } from "../data/mockRoommates";

export const useRoommates = () => {
  const { users, currentUser } = useContext(AuthContext);

  // Return all regular users except the active user
  const candidates = users.filter(
    user => user.role === "user" && user.id !== currentUser?.id
  );

  // Compute or retrieve precomputed compatibility
  const getCompatibility = (roommateId) => {
    // Check if pre-configured
    const precomputed = mockRoommates.find(r => r.userId === roommateId);
    if (precomputed) return precomputed;

    // Fallback calculation for dynamically registered users
    if (!currentUser) return { compatibilityScore: 70, matchingPreferences: [], mismatchPreferences: [] };

    const uPref = currentUser.preferences || {};
    const rUser = users.find(u => u.id === roommateId);
    const rPref = rUser?.preferences || {};

    let matchCount = 0;
    let totalFields = 0;
    const matchingPreferences = [];
    const mismatchPreferences = [];

    const keys = ["smoke", "pet", "clean", "sleep", "social"];
    keys.forEach(key => {
      totalFields++;
      if (uPref[key] === rPref[key]) {
        matchCount++;
        matchingPreferences.push({
          category: key.charAt(0).toUpperCase() + key.slice(1),
          match: true,
          label: `Both prefer ${uPref[key]} for ${key}`
        });
      } else {
        mismatchPreferences.push({
          category: key.charAt(0).toUpperCase() + key.slice(1),
          match: false,
          label: `Different preference: ${uPref[key]} vs ${rPref[key]}`
        });
      }
    });

    const score = Math.round((matchCount / totalFields) * 100);

    return {
      userId: roommateId,
      compatibilityScore: score,
      matchingPreferences,
      mismatchPreferences,
      breakdown: {
        cleanliness: uPref.clean === rPref.clean ? 100 : 50,
        sleepSchedule: uPref.sleep === rPref.sleep ? 100 : 50,
        socialLife: uPref.social === rPref.social ? 100 : 50,
        hobbiesSharing: 70
      }
    };
  };

  return {
    candidates,
    getCompatibility
  };
};
