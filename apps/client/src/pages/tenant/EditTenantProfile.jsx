/**
 * EditTenantProfile.jsx
 *
 * Saves changes to PATCH /api/users/:id (real MySQL backend).
 * Profile image upload calls POST /api/profile.
 * updateProfile() in AuthContext is called after successful save
 * to keep the in-memory user object in sync.
 */
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Button from "@shared/components/common/Button";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";
import { SingleImageUpload } from "@shared/components/common/ImageUpload";
import { apiUploadProfileImage, apiDeleteProfileImage, apiUpdateUser } from "@shared/services/api";

export const EditTenantProfile = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Initialise all fields from currentUser
  const [name,       setName]       = useState(currentUser?.name       || "");
  const [phone,      setPhone]      = useState(currentUser?.phone      || "");
  const [university, setUniversity] = useState(currentUser?.university || "");
  const [major,      setMajor]      = useState(currentUser?.major      || "");
  const [age,        setAge]        = useState(currentUser?.age        || "");
  const [gender,     setGender]     = useState(currentUser?.gender     || "Male");
  const [city,       setCity]       = useState(currentUser?.city       || "");
  // Budget stored as two integers in DB — display as range selector
  const [budgetMin,  setBudgetMin]  = useState(currentUser?.budget_min || 500);
  const [budgetMax,  setBudgetMax]  = useState(currentUser?.budget_max || 1200);
  const [bio,        setBio]        = useState(currentUser?.bio        || "");
  const [hobbiesStr, setHobbiesStr] = useState(
    Array.isArray(currentUser?.hobbies) ? currentUser.hobbies.join(", ") : ""
  );
  const [avatarUrl,  setAvatarUrl]  = useState(currentUser?.avatar || null);

  const [imageError, setImageError] = useState("");
  const [saveError,  setSaveError]  = useState("");
  const [saving,     setSaving]     = useState(false);

  // ── Profile image upload / remove ──────────────────────────────────────
  const handleProfileImageUpload = async (file) => {
    setImageError("");
    try {
      const data = await apiUploadProfileImage(file);
      const fullUrl = `http://localhost:4000${data.imageUrl}`;
      setAvatarUrl(fullUrl);
      updateProfile({ avatar: fullUrl });
    } catch (err) {
      setImageError(err.message || "Failed to upload profile image.");
      throw err;
    }
  };

  const handleProfileImageRemove = async () => {
    setImageError("");
    try {
      await apiDeleteProfileImage();
      setAvatarUrl(null);
      updateProfile({ avatar: null });
    } catch (err) {
      setImageError(err.message || "Failed to remove profile image.");
      throw err;
    }
  };

  // ── Save profile to backend ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    const hobbies = hobbiesStr
      .split(",")
      .map(h => h.trim())
      .filter(h => h.length > 0);

    try {
      const data = await apiUpdateUser(currentUser.id, {
        name:       name.trim(),
        phone:      phone.trim() || null,
        university: university.trim() || null,
        major:      major.trim() || null,
        age:        Number(age) || null,
        gender:     gender || null,
        city:       city.trim() || null,
        budget_min: Number(budgetMin) || null,
        budget_max: Number(budgetMax) || null,
        bio:        bio.trim() || null,
        hobbies,
      });

      // Sync context with the freshly-saved server response
      updateProfile({
        name:       data.user.name,
        phone:      data.user.phone,
        university: data.user.university,
        major:      data.user.major,
        age:        data.user.age,
        gender:     data.user.gender,
        city:       data.user.city,
        budget_min: data.user.budget_min,
        budget_max: data.user.budget_max,
        bio:        data.user.bio,
        hobbies:    data.user.hobbies,
        preferences: data.user.preferences,
      });

      navigate("/user/profile");
    } catch (err) {
      setSaveError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const genderOptions = [
    { value: "Male",       label: "Male" },
    { value: "Female",     label: "Female" },
    { value: "Non-binary", label: "Non-binary" },
    { value: "Other",      label: "Other" },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Edit Profile</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Update your information and search parameters
          </p>
        </div>
      </div>

      {/* Profile image upload */}
      <div className="flex items-center gap-5 p-4 bg-surface-container-low rounded-xl border border-outline-variant mb-6">
        <SingleImageUpload
          mode="single"
          label=""
          currentImageUrl={avatarUrl}
          onUpload={handleProfileImageUpload}
          onRemove={avatarUrl ? handleProfileImageRemove : undefined}
          maxSizeMB={5}
        />
        <div>
          <p className="font-label-md text-label-md text-on-surface font-bold">Profile Photo</p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            Represents your RoomieMatch profile.<br />
            <span className="text-outline">Not an identity verification document.</span>
          </p>
          {imageError && <p className="text-xs text-error mt-1">{imageError}</p>}
        </div>
      </div>

      {saveError && (
        <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name"     value={name}  onChange={e => setName(e.target.value)}  required />
          <Input label="Phone Number"  value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="University"    value={university} onChange={e => setUniversity(e.target.value)} />
          <Input label="Major / Program" value={major}   onChange={e => setMajor(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Age" type="number" min="16" max="99"
            value={age} onChange={e => setAge(e.target.value)}
          />
          <Select
            label="Gender" value={gender}
            onChange={e => setGender(e.target.value)}
            options={genderOptions}
          />
          <Input
            label="City" value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Metro City"
          />
        </div>

        {/* Budget — two number inputs, maps to budget_min / budget_max */}
        <div className="space-y-1">
          <span className="block font-label-md text-label-md text-on-surface">Monthly Budget Range (Rs./month)</span>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum" type="number" min="0"
              value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
              placeholder="500"
            />
            <Input
              label="Maximum" type="number" min="0"
              value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
              placeholder="1200"
            />
          </div>
          {budgetMin && budgetMax && (
            <p className="text-xs text-on-surface-variant mt-1">
              Budget: Rs. {Number(budgetMin).toLocaleString()} – Rs. {Number(budgetMax).toLocaleString()} /month
            </p>
          )}
        </div>

        <Input
          label="Hobbies & Interests (comma-separated)"
          value={hobbiesStr}
          onChange={e => setHobbiesStr(e.target.value)}
          placeholder="Hiking, Cooking, Board Games, Coding"
        />

        <Textarea
          label="Bio / Description"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell prospective roommates about yourself..."
          rows={5}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
          <Button type="button" variant="outline" onClick={() => navigate("/user/profile")} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Saving...
              </span>
            ) : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTenantProfile;
