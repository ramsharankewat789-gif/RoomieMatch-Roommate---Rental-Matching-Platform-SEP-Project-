import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProperties } from "@shared/hooks/useProperties";
import Button from "@shared/components/common/Button";
import Input from "@shared/components/common/Input";
import Select from "@shared/components/common/Select";
import Textarea from "@shared/components/common/Textarea";

export const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, editProperty } = useProperties();

  const property = properties.find((p) => p.id === id);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Metro City");
  const [type, setType] = useState("Apartment");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [description, setDescription] = useState("");
  const [rulesStr, setRulesStr] = useState("");
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setAddress(property.address);
      setCity(property.city);
      setType(property.type);
      setBedrooms(String(property.bedrooms));
      setBathrooms(String(property.bathrooms));
      setPrice(String(property.price));
      setDeposit(String(property.deposit));
      setDescription(property.description);
      setRulesStr(property.rules?.join(", ") || "");
      setAmenities(property.amenities || []);
    }
  }, [property]);

  if (!property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-surface-container-lowest border rounded-xl">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-2">Listing Not Found</h3>
        <p className="text-body-md text-on-surface-variant mt-2">The property listing you are trying to edit does not exist.</p>
        <Button onClick={() => navigate("/user/my-properties")} className="mt-4 mx-auto">
          Back to Listings
        </Button>
      </div>
    );
  }

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setAmenities(prev => [...prev, amenity]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const rules = rulesStr
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    editProperty(property.id, {
      title,
      address,
      city,
      type,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      price: Number(price),
      deposit: Number(deposit) || Number(price),
      description,
      rules,
      amenities
    });

    alert("Property listing updated successfully!");
    navigate("/user/my-properties");
  };

  const typeOptions = [
    { value: "Apartment", label: "Apartment" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Studio", label: "Studio" },
    { value: "House", label: "Single House" }
  ];

  const countOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" }
  ];

  const amenitiesList = [
    "Wifi",
    "Air Conditioning",
    "On-site Laundry",
    "In-unit Laundry",
    "Parking Spot",
    "Garage Parking",
    "Fully Furnished",
    "Dishwasher",
    "Private Backyard"
  ];

  return (
    <div className="max-w-3xl mx-auto bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
      <div className="mb-6">
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Edit Property Listing</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Modify specification details, pricing structures, or lease rules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Property Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select
            label="Property Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={typeOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            containerClassName="md:col-span-2"
          />
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Bedrooms"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            options={countOptions}
          />
          <Select
            label="Bathrooms"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            options={countOptions}
          />
          <Input
            label="Rent ($ / month)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Input
            label="Deposit ($)"
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />
        </div>

        <Textarea
          label="Detailed Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
        />

        <Input
          label="House Rules (comma-separated)"
          value={rulesStr}
          onChange={(e) => setRulesStr(e.target.value)}
        />

        <div className="space-y-2">
          <span className="font-label-md text-label-md text-on-surface-variant font-bold block">
            Select Amenities
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenitiesList.map((amenity) => {
              const isChecked = amenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer select-none transition-colors ${
                    isChecked
                      ? "bg-primary-container/10 border-primary text-primary"
                      : "bg-surface border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAmenity(amenity)}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-body-md text-body-md font-semibold">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/60">
          <Button type="button" variant="outline" onClick={() => navigate("/user/my-properties")}>
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

export default EditProperty;
