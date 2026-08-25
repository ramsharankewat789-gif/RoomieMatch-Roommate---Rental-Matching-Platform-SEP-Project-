/**
 * useRoommates.js — Real API-backed roommate discovery with PRD-weighted scoring.
 *
 * PRD compatibility weights:
 *   Budget (30%) + Lifestyle (30%) + Interests/Hobbies (20%) + Location (10%) + Occupation (10%)
 *
 * Scores are persisted to MySQL via POST /api/compatibility/save after compute.
 */
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiListUsers, apiGetUser, apiSaveCompatibilityScores } from "../services/api";

// ── PRD-weighted compatibility calculator ────────────────────────────────────
function computeCompatibility(currentUser, candidate) {
  // ── Budget (30%) ──────────────────────────────────────────────────────────
  const uMin = currentUser?.budget_min, uMax = currentUser?.budget_max;
  const cMin = candidate?.budget_min,   cMax = candidate?.budget_max;
  let budgetScore = 50;
  if (uMin && uMax && cMin && cMax) {
    const overlapMin = Math.max(uMin, cMin);
    const overlapMax = Math.min(uMax, cMax);
    if (overlapMin <= overlapMax) {
      const overlapRange  = overlapMax - overlapMin;
      const currentRange  = uMax - uMin || 1;
      budgetScore = Math.min(100, Math.round(50 + (overlapRange / currentRange) * 50));
    } else {
      // Penalty for gap between budgets
      const gap = overlapMin - overlapMax;
      const avgBudget = (uMax + cMax) / 2 || 1;
      budgetScore = Math.max(0, Math.round(50 - (gap / avgBudget) * 100));
    }
  }

  // ── Lifestyle (30%) ───────────────────────────────────────────────────────
  const uPref = currentUser?.preferences || {};
  const cPref = candidate?.preferences   || {};

  const lifestyleKeys = [
    { key: "smoke",    label: "Smoking" },
    { key: "pet",      label: "Pets" },
    { key: "clean",    label: "Cleanliness" },
    { key: "sleep",    label: "Sleep Schedule" },
    { key: "social",   label: "Social Life" },
    { key: "cooking",  label: "Cooking" },
    { key: "drinking", label: "Drinking" },
    { key: "guests",   label: "Guests" },
  ];

  let lifestyleMatches = 0;
  let lifestyleTotal   = 0;
  const matchingPreferences  = [];
  const mismatchPreferences  = [];

  lifestyleKeys.forEach(({ key, label }) => {
    if (!uPref[key] || !cPref[key]) return;
    lifestyleTotal++;
    if (uPref[key] === cPref[key]) {
      lifestyleMatches++;
      matchingPreferences.push({ category: label, match: true,  label: `Both: ${uPref[key]}` });
    } else {
      mismatchPreferences.push({ category: label, match: false, label: `${uPref[key]} vs ${cPref[key]}` });
    }
  });
  const lifestyleScore = lifestyleTotal > 0
    ? Math.round((lifestyleMatches / lifestyleTotal) * 100)
    : 50;

  // ── Interests / Hobbies (20%) ─────────────────────────────────────────────
  const uHobbies = currentUser?.hobbies || [];
  const cHobbies = candidate?.hobbies   || [];
  const hobbyOverlap = uHobbies.filter(h => cHobbies.includes(h)).length;
  const hobbyDenom   = Math.max(uHobbies.length, cHobbies.length, 1);
  const interestsScore = Math.round((hobbyOverlap / hobbyDenom) * 100);

  // ── Location (10%) ────────────────────────────────────────────────────────
  const uCity = (currentUser?.city || "").toLowerCase().trim();
  const cCity = (candidate?.city   || "").toLowerCase().trim();
  const locationScore = uCity && cCity && uCity === cCity ? 100 : uCity && cCity ? 20 : 50;

  // ── Occupation / Study (10%) ──────────────────────────────────────────────
  const uUni = (currentUser?.university || "").toLowerCase().trim();
  const cUni = (candidate?.university   || "").toLowerCase().trim();
  const occupationScore = uUni && cUni && uUni === cUni ? 100
    : (currentUser?.major || "") === (candidate?.major || "") && currentUser?.major ? 70
    : 40;

  // ── Weighted composite ────────────────────────────────────────────────────
  const compositeScore = Math.round(
    budgetScore     * 0.30 +
    lifestyleScore  * 0.30 +
    interestsScore  * 0.20 +
    locationScore   * 0.10 +
    occupationScore * 0.10
  );

  return {
    compatibilityScore: compositeScore,
    matchingPreferences,
    mismatchPreferences,
    breakdown: {
      budget:        budgetScore,
      lifestyle:     lifestyleScore,
      interests:     interestsScore,
      location:      locationScore,
      occupation:    occupationScore,
    }
  };
}

export const useRoommates = () => {
  const { currentUser } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!currentUser) { setCandidates([]); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch public user list (now allowed for authenticated users)
        const data = await apiListUsers({ role: "user", limit: 100 });
        if (cancelled) return;

        const others = (data.users || []).filter(u => u.id !== currentUser.id);

        // Fetch full profiles for top 20 for better matching data
        const subset = others.slice(0, 20);
        const profiles = await Promise.all(
          subset.map(u =>
            apiGetUser(u.id)
              .then(d => d.user)
              .catch(() => u)
          )
        );

        if (cancelled) return;
        const validProfiles = profiles.filter(Boolean);
        setCandidates(validProfiles);

        // Persist scores to MySQL
        try {
          const scoresToSave = validProfiles.map(candidate => {
            const { compatibilityScore, breakdown } = computeCompatibility(currentUser, candidate);
            return {
              candidate_id:    candidate.id,
              score:           compatibilityScore,
              budget_score:    breakdown.budget,
              lifestyle_score: breakdown.lifestyle,
              interests_score: breakdown.interests,
            };
          });
          if (scoresToSave.length > 0) {
            await apiSaveCompatibilityScores(scoresToSave);
          }
        } catch (saveErr) {
          console.warn("[useRoommates] Score persistence failed:", saveErr.message);
        }
      } catch (err) {
        console.warn("[useRoommates] Failed to load candidates:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const getCompatibility = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return { compatibilityScore: 0, matchingPreferences: [], mismatchPreferences: [], breakdown: {} };
    return computeCompatibility(currentUser, candidate);
  };

  return { candidates, loading, getCompatibility, computeCompatibility };
};
