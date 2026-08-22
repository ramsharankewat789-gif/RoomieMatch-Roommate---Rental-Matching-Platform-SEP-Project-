import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Button from "@shared/components/common/Button";
import Select from "@shared/components/common/Select";

export const LifestylePreferences = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [smoke, setSmoke] = useState(currentUser?.preferences?.smoke || "No");
  const [pet, setPet] = useState(currentUser?.preferences?.pet || "No Pets");
  const [clean, setClean] = useState(currentUser?.preferences?.clean || "Medium");
  const [sleep, setSleep] = useState(currentUser?.preferences?.sleep || "Early Bird");
  const [social, setSocial] = useState(currentUser?.preferences?.social || "Medium");
  const [cooking, setCooking] = useState(currentUser?.preferences?.cooking || "Sometimes");

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      preferences: {
        smoke,
        pet,
        clean,
        sleep,
        social,
        cooking
      }
    });
    navigate("/user/profile");
  };

  const yesNoOptions = [
    { value: "No", label: "No" },
    { value: "Yes", label: "Yes" }
  ];

  const petOptions = [
    { value: "No Pets", label: "No Pets" },
    { value: "Cats Only", label: "Cats Only" },
    { value: "Dogs Only", label: "Dogs Only" },
    { value: "Pets Allowed", label: "Pets Allowed" }
  ];

  const levelOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" }
  ];

  const sleepOptions = [
    { value: "Early Bird", label: "Early Bird" },
    { value: "Night Owl", label: "Night Owl" },
    { value: "Flexible", label: "Flexible" }
  ];

  const cookingOptions = [
    { value: "Rarely", label: "Rarely" },
    { value: "Sometimes", label: "Sometimes" },
    { value: "Often", label: "Often" }
  ];

  return (
    <div className="max-w-xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container/20 text-primary mb-3">
          <span className="material-symbols-outlined text-3xl font-bold">tune</span>
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Lifestyle Preferences Quiz</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Adjust your options to match with compatible roommates
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Select
          label="Do you smoke?"
          value={smoke}
          onChange={(e) => setSmoke(e.target.value)}
          options={yesNoOptions}
        />

        <Select
          label="Pets preferences"
          value={pet}
          onChange={(e) => setPet(e.target.value)}
          options={petOptions}
        />

        <Select
          label="Cleanliness levels inside shared areas"
          value={clean}
          onChange={(e) => setClean(e.target.value)}
          options={levelOptions}
        />

        <Select
          label="Sleep schedule / Sleeping patterns"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          options={sleepOptions}
        />

        <Select
          label="Social engagement / Having friends over"
          value={social}
          onChange={(e) => setSocial(e.target.value)}
          options={levelOptions}
        />

        <Select
          label="How often do you cook at home?"
          value={cooking}
          onChange={(e) => setCooking(e.target.value)}
          options={cookingOptions}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/60 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/user/profile")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LifestylePreferences;
