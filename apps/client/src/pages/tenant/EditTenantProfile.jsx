import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import Button from "@shared/components/common/Button";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";
import { SingleImageUpload } from "@shared/components/common/ImageUpload";
import { apiUploadProfileImage, apiDeleteProfileImage } from "@shared/services/api";

export const EditTenantProfile = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName]           = useState(currentUser?.name || "");
  const [phone, setPhone]         = useState(currentUser?.phone || "");
  const [university, setUniversity] = useState(currentUser?.university || "");
  const [major, setMajor]         = useState(currentUser?.major || "");
  const [age, setAge]             = useState(currentUser?.age || 20);
  const [gender, setGender]       = useState(currentUser?.gender || "Male");
  const [budget, setBudget]       = useState(currentUser?.budget || "$800 - $1,200");
  const [bio, setBio]             = useState(currentUser?.bio || "");
  const [hobbiesStr, setHobbiesStr] = useState(currentUser?.hobbies?.join(", ") || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || null);
  const [imageError, setImageError] = useState("");

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

  const handleSave = (e) => {
    e.preventDefault();
    
    // Parse hobbies
    const hobbies = hobbiesStr
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    updateProfile({
      name,
      phone,
      university,
      major,
      age: Number(age),
      gender,
      budget,
      bio,
      hobbies
    });

    navigate("/user/profile");
  };

  const budgetOptions = [
    { value: "$500 - $800", label: "$500 - $800" },
    { value: "$800 - $1,200", label: "$800 - $1,200" },
    { value: "$1,200 - $1,600", label: "$1,200 - $1,600" },
    { value: "$1,600 - $2,000", label: "$1,600 - $2,000" },
    { value: "$2,000+", label: "$2,000+" }
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Non-binary", label: "Non-binary" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Edit Tenant Profile</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Update your academic information and search parameters
          </p>
        </div>
      </div>

      {/* Profile image — separate from identity verification */}
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="University"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            required
          />
          <Input
            label="Major / Program"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genderOptions}
          />
          <Select
            label="Monthly Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            options={budgetOptions}
          />
        </div>

        <Input
          label="Hobbies & Interests (comma-separated)"
          value={hobbiesStr}
          onChange={(e) => setHobbiesStr(e.target.value)}
          placeholder="Hiking, Cooking, Board Games, Coding"
        />

        <Textarea
          label="Bio / Description"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell prospective roommates about yourself..."
          rows={5}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
          <Button type="button" variant="outline" onClick={() => navigate("/user/profile")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTenantProfile;
