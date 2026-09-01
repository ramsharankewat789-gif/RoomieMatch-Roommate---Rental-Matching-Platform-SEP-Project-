/**
 * LifestylePreferences.jsx
 *
 * Saves lifestyle preferences to PATCH /api/users/:id (real MySQL backend).
 * Includes all 10 PRD-required preference fields:
 * smoke, pet, cleanliness, sleep_schedule, social_life, cooking,
 * drinking, guests, food, working_hours.
 */
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { apiUpdateUser } from "@shared/services/api";
import Button from "@shared/components/common/Button";

const PREFERENCES = [
  {
    key: "smoke",
    label: "Smoking",
    icon: "smoking_rooms",
    options: ["No", "Outside Only", "Yes"],
  },
  {
    key: "drinking",
    label: "Drinking",
    icon: "local_bar",
    options: ["No", "Socially", "Regularly"],
  },
  {
    key: "pet",
    label: "Pets",
    icon: "pets",
    options: ["No Pets", "Cats Allowed", "Dogs Allowed", "Dog or Cat Allowed", "Pets Allowed"],
  },
  {
    key: "clean",
    label: "Cleanliness",
    icon: "cleaning_services",
    options: ["Low", "Medium", "High", "Very High"],
  },
  {
    key: "sleep",
    label: "Sleep Schedule",
    icon: "bedtime",
    options: ["Early Bird", "Night Owl", "Flexible"],
  },
  {
    key: "social",
    label: "Social Life",
    icon: "group",
    options: ["Introvert", "Medium", "High", "Very Social"],
  },
  {
    key: "cooking",
    label: "Cooking",
    icon: "restaurant",
    options: ["Never", "Sometimes", "Often", "Every Day"],
  },
  {
    key: "guests",
    label: "Guests / Visitors",
    icon: "person_add",
    options: ["No Guests", "Occasionally", "Regularly", "Frequently"],
  },
  {
    key: "food",
    label: "Food Preference",
    icon: "lunch_dining",
    options: ["No Preference", "Vegetarian", "Vegan", "Halal", "Kosher"],
  },
  {
    key: "working_hours",
    label: "Working / Study Hours",
    icon: "schedule",
    options: ["Regular Hours", "Early Shifts", "Late Night", "Remote / Flexible"],
  },
];

export const LifestylePreferences = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const p = currentUser?.preferences || {};

  const [prefs, setPrefs] = useState({
    smoke:         p.smoke         || "No",
    drinking:      p.drinking      || "No",
    pet:           p.pet           || "No Pets",
    clean:         p.clean         || "Medium",
    sleep:         p.sleep         || "Early Bird",
    social:        p.social        || "Medium",
    cooking:       p.cooking       || "Sometimes",
    guests:        p.guests        || "Occasionally",
    food:          p.food          || "No Preference",
    working_hours: p.working_hours || "Regular Hours",
  });

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const setOption = (key, val) => setPrefs(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const data = await apiUpdateUser(currentUser.id, prefs);
      updateProfile({ preferences: data.user.preferences });
      setSaved(true);
      setTimeout(() => navigate("/user/profile"), 1200);
    } catch (err) {
      setError(err.message || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Lifestyle Quiz</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Answer honestly — this helps us match you with compatible roommates
        </p>
      </div>

      {saved && (
        <div className="bg-secondary-container/20 border border-secondary/40 text-secondary p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Preferences saved! Redirecting to profile...
        </div>
      )}
      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          {error}
        </div>
      )}

      <div className="space-y-4">
        {PREFERENCES.map(({ key, label, icon, options }) => (
          <div
            key={key}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
              <h3 className="font-label-md text-label-md text-on-surface font-bold">{label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOption(key, opt)}
                  className={`px-4 py-2 rounded-xl border font-label-md text-label-md transition-all select-none ${
                    prefs[key] === opt
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate("/user/profile")} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="px-8">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Saving...
            </span>
          ) : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};

export default LifestylePreferences;
