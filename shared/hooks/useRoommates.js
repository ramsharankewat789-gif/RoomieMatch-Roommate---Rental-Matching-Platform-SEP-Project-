/**
 * useRoommates.js — Real API-backed roommate discovery.
 *
 * Fetches tenant-type users from GET /api/users?role=user (server-filtered).
 * Compatibility scoring is computed client-side from preferences returned by the API.
 *
 * Usage:
 *   const { candidates, loading, getCompatibility } = useRoommates();
 */
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiListUsers, apiGetUser } from "../services/api";

// ── Client-side compatibility calculator ────────────────────────────────────
function computeCompatibility(currentUser, candidate) {
  const uPref = currentUser?.preferences || {};
  const cPref = candidate?.preferences   || {};

  const keys = [
    { key: "smoke",   label: "Smoking" },
    { key: "pet",     label: "Pets" },
    { key: "clean",   label: "Cleanliness" },
    { key: "sleep",   label: "Sleep Schedule" },
    { key: "social",  label: "Social Life" },
    { key: "cooking", label: "Cooking" },
  ];

  let matchCount = 0;
  const matchingPreferences  = [];
  const mismatchPreferences  = [];

  keys.forEach(({ key, label }) => {
    if (!uPref[key] || !cPref[key]) return; // skip if either side missing
    if (uPref[key] === cPref[key]) {
      matchCount++;
      matchingPreferences.push({ category: label, match: true,  label: `Both prefer: ${uPref[key]}` });
    } else {
      mismatchPreferences.push({ category: label, match: false, label: `${uPref[key]} vs ${cPref[key]}` });
    }
  });

  const total = matchingPreferences.length + mismatchPreferences.length;
  const score = total > 0 ? Math.round((matchCount / total) * 100) : 70;

  // Budget overlap bonus
  const uMin = currentUser?.budget_min, uMax = currentUser?.budget_max;
  const cMin = candidate?.budget_min,   cMax = candidate?.budget_max;
  let budgetScore = 70;
  if (uMin && uMax && cMin && cMax) {
    const overlapMin = Math.max(uMin, cMin);
    const overlapMax = Math.min(uMax, cMax);
    budgetScore = overlapMin <= overlapMax ? 100 : 30;
  }

  // Hobby overlap
  const uHobbies = currentUser?.hobbies || [];
  const cHobbies = candidate?.hobbies   || [];
  const hobbyOverlap = uHobbies.filter(h => cHobbies.includes(h)).length;
  const hobbyScore   = uHobbies.length > 0
    ? Math.min(100, Math.round((hobbyOverlap / uHobbies.length) * 100) + 50)
    : 70;

  return {
    compatibilityScore: score,
    matchingPreferences,
    mismatchPreferences,
    breakdown: {
      cleanliness:   uPref.clean  === cPref.clean  ? 100 : 50,
      sleepSchedule: uPref.sleep  === cPref.sleep  ? 100 : 50,
      socialLife:    uPref.social === cPref.social ? 100 : 50,
      budget:        budgetScore,
      hobbiesSharing: hobbyScore,
    }
  };
}

export const useRoommates = () => {
  const { currentUser } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!currentUser) { setCandidates([]); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch all regular users (role=user) — server paginates to 100 max
        const data = await apiListUsers({ role: "user", limit: 100 });
        if (cancelled) return;

        // Filter out self
        const tenants = (data.users || []).filter(
          u => u.id !== currentUser.id
        );

        // Fetch full profiles (preferences + hobbies) for each candidate in parallel
        // Limit to first 20 to avoid too many requests
        const subset = tenants.slice(0, 20);
        const profiles = await Promise.all(
          subset.map(u =>
            apiGetUser(u.id)
              .then(d => d.user)
              .catch(() => u) // fall back to list data if full profile fails
          )
        );
        if (!cancelled) setCandidates(profiles.filter(Boolean));
      } catch {
        // Silent — page still renders without candidates
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const getCompatibility = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return { compatibilityScore: 70, matchingPreferences: [], mismatchPreferences: [] };
    return computeCompatibility(currentUser, candidate);
  };

  return { candidates, loading, getCompatibility };
};
