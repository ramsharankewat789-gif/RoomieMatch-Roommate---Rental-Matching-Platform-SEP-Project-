import { useState, useEffect } from "react";
import { mockProperties } from "../data/mockProperties";

export const useProperties = () => {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem("roomiematch_properties");
    return saved ? JSON.parse(saved) : mockProperties;
  });

  useEffect(() => {
    localStorage.setItem("roomiematch_properties", JSON.stringify(properties));
  }, [properties]);

  const addProperty = (ownerId, propData) => {
    const newProperty = {
      id: "p_" + Date.now(),
      ownerId,
      title: propData.title,
      address: propData.address,
      city: propData.city || "Metro City",
      type: propData.type || "Apartment",
      bedrooms: Number(propData.bedrooms) || 1,
      bathrooms: Number(propData.bathrooms) || 1,
      price: Number(propData.price) || 500,
      deposit: Number(propData.deposit) || Number(propData.price) || 500,
      description: propData.description || "",
      isVerified: false, // Must be verified by admin
      images: propData.images && propData.images.length > 0 
        ? propData.images 
        : ["https://lh3.googleusercontent.com/aida-public/AB6AXuCw198F3RReoAWQPDB6NBvw5ITvvjUJWnfgJ0h4eFG3yULmEEENUJT-eaYDrCdOKVlD-zLMi0WGnIVlaQhOKvcqs8lu9UcBbBH-Qe1i21rLIxCZxsvd59tEVBy6kSBNFxDMXhpJdY6rqmCtF8uQ3kFALY9GEdsaumK0Y7m5LtgKXTr63aJYRuft8TaU1PvS79p3tU2NCT402jvJrmqJjQaxpWNLjiUqcaZwwkmG1nC__PfFe0nsJVrHQEwrZ8nTT4STJg"],
      amenities: propData.amenities || [],
      rules: propData.rules || [],
      availableFrom: propData.availableFrom || new Date().toISOString().split('T')[0],
      status: "active"
    };

    setProperties(prev => [newProperty, ...prev]);
    return newProperty;
  };

  const editProperty = (propertyId, updatedFields) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProperty = (propertyId) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const verifyProperty = (propertyId) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, isVerified: true } : p))
    );
  };

  return {
    properties,
    setProperties,
    addProperty,
    editProperty,
    deleteProperty,
    verifyProperty
  };
};
