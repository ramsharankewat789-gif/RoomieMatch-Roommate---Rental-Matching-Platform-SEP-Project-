/**
 * AddProperty.jsx
 *
 * Creates a property via POST /api/properties then uploads images via
 * POST /api/properties/:id/images.
 * Uses useProperties.createProperty(data, imageFiles[]) which handles
 * both steps — no userId param needed (JWT identifies the owner).
 */
import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useProperties } from "@shared/hooks/useProperties";
import Button from "@shared/components/common/Button";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";

const MAX_IMAGES  = 6;
const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTS  = [".jpg", ".jpeg", ".png", ".webp"];

export const AddProperty = () => {
  const { currentUser }    = useContext(AuthContext);
  const { createProperty } = useProperties();
  const navigate           = useNavigate();
  const fileInputRef       = useRef(null);

  const [title,       setTitle]       = useState("");
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("Metro City");
  const [type,        setType]        = useState("Apartment");
  const [bedrooms,    setBedrooms]    = useState("2");
  const [bathrooms,   setBathrooms]   = useState("2");
  const [price,       setPrice]       = useState("");
  const [deposit,     setDeposit]     = useState("");
  const [description, setDescription] = useState("");
  const [rulesStr,    setRulesStr]    = useState("No smoking, No loud parties after 10 PM");
  const [amenities,   setAmenities]   = useState([]);
  const [availableFrom, setAvailableFrom] = useState("");

  // Image state
  const [imageFiles,  setImageFiles]  = useState([]);   // {file, preview, isPrimary}
  const [imageError,  setImageError]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleAmenity = (a) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  // ── Image selection ────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    setImageError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (imageFiles.length + files.length > MAX_IMAGES) {
      setImageError(`You can upload up to ${MAX_IMAGES} property images.`);
      e.target.value = "";
      return;
    }

    const newImages = [];
    for (const file of files) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) || !ALLOWED_EXTS.includes(ext)) {
        setImageError("Please upload JPG, PNG, or WEBP images only.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setImageError(`Image size exceeds the ${MAX_SIZE_MB} MB limit.`);
        e.target.value = "";
        return;
      }
      const isPrimary = imageFiles.length === 0 && newImages.length === 0;
      newImages.push({ file, preview: URL.createObjectURL(file), isPrimary });
    }
    setImageFiles(prev => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImageFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx]?.isPrimary && next.length > 0) next[0] = { ...next[0], isPrimary: true };
      URL.revokeObjectURL(prev[idx].preview);
      return next;
    });
  };

  const setPrimary = (idx) =>
    setImageFiles(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const rules = rulesStr.split(",").map(r => r.trim()).filter(Boolean);

      // Re-order so primary image is first
      const orderedFiles = [...imageFiles]
        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        .map(f => f.file);

      // createProperty handles both POST /api/properties and POST /api/properties/:id/images
      await createProperty(
        {
          title, address, city, type,
          bedrooms:      Number(bedrooms),
          bathrooms:     Number(bathrooms),
          price:         Number(price),
          deposit:       Number(deposit) || Number(price) || 0,
          description,
          available_from: availableFrom || null,
          rules,
          amenities,
        },
        orderedFiles  // image files — passed as second arg
      );

      imageFiles.forEach(f => URL.revokeObjectURL(f.preview));
      navigate("/user/my-properties");
    } catch (err) {
      setSubmitError(err.message || "Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions   = [
    { value: "Apartment", label: "Apartment" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Studio",    label: "Studio" },
    { value: "House",     label: "Single House" },
  ];
  const countOptions  = ["1","2","3","4+"].map(v => ({ value: v, label: v }));
  const amenitiesList = [
    "Wifi", "Air Conditioning", "On-site Laundry", "In-unit Laundry",
    "Parking Spot", "Garage Parking", "Fully Furnished", "Dishwasher",
    "Private Backyard",
  ];

  return (
    <div className="max-w-3xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="mb-6">
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Add New Property</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Enter the details for your rental listing
        </p>
      </div>

      {submitError && (
        <div className="bg-error-container/20 border border-error/40 text-error p-3 rounded-lg text-sm font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Property Title" value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. University Gardens Apartment" required
          />
          <Select
            label="Property Type" value={type}
            onChange={e => setType(e.target.value)}
            options={typeOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Address" value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. 104 University Ave" required
            containerClassName="md:col-span-2"
          />
          <Input
            label="City" value={city}
            onChange={e => setCity(e.target.value)} required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Bedrooms"  value={bedrooms}  onChange={e => setBedrooms(e.target.value)}  options={countOptions} />
          <Select label="Bathrooms" value={bathrooms} onChange={e => setBathrooms(e.target.value)} options={countOptions} />
          <Input
            label="Rent ($/month)" type="number" min="1"
            value={price} onChange={e => setPrice(e.target.value)}
            placeholder="950" required
          />
          <Input
            label="Deposit ($)" type="number" min="0"
            value={deposit} onChange={e => setDeposit(e.target.value)}
            placeholder="950"
          />
        </div>

        <Input
          label="Available From (optional)" type="date"
          value={availableFrom} onChange={e => setAvailableFrom(e.target.value)}
        />

        <Textarea
          label="Detailed Description"
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe the unit, nearby universities, utilities included..."
          rows={5} required
        />

        <Input
          label="House Rules (comma-separated)"
          value={rulesStr} onChange={e => setRulesStr(e.target.value)}
          placeholder="No smoking, No loud parties after 10 PM"
        />

        {/* Amenities */}
        <div className="space-y-2">
          <span className="font-label-md text-label-md text-on-surface-variant font-bold block">
            Amenities
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenitiesList.map(a => {
              const checked = amenities.includes(a);
              return (
                <label
                  key={a}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer select-none transition-colors ${
                    checked
                      ? "bg-primary-container/10 border-primary text-primary"
                      : "bg-surface border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <input
                    type="checkbox" checked={checked}
                    onChange={() => toggleAmenity(a)}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-md text-body-md font-semibold">{a}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Property Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-bold">
              Property Photos <span className="text-outline font-normal">(optional, up to {MAX_IMAGES})</span>
            </span>
            <span className="text-xs text-outline">{imageFiles.length}/{MAX_IMAGES}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {imageFiles.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.preview} alt=""
                  className={`w-24 h-20 object-cover rounded-xl border-2 transition-all ${
                    img.isPrimary ? "border-primary shadow-md" : "border-outline-variant"
                  }`}
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                  {!img.isPrimary && (
                    <button
                      type="button" title="Set as cover"
                      onClick={() => setPrimary(idx)}
                      className="bg-primary text-on-primary rounded-full p-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">star</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="bg-error text-on-error rounded-full p-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {imageFiles.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-20 border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[24px] text-outline">add_photo_alternate</span>
                <span className="text-[10px] text-outline font-semibold">Add Photo</span>
              </button>
            )}
          </div>

          {imageError && (
            <p className="text-xs text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {imageError}
            </p>
          )}
          <p className="text-xs text-outline">
            JPG, PNG, WEBP · Max {MAX_SIZE_MB} MB each · First (starred) image becomes the cover photo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/60">
          <Button
            type="button" variant="outline"
            onClick={() => navigate("/user/my-properties")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Submitting...
              </span>
            ) : "Submit Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
