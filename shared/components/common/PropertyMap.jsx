/**
 * PropertyMap.jsx — Reusable Leaflet map component.
 *
 * Usage (single property):
 *   <PropertyMap lat={51.5074} lng={-0.1278} title="University Gardens" />
 *
 * Usage (multiple properties):
 *   <PropertyMap properties={[{ id, title, latitude, longitude, price, address }]} />
 *
 * Uses OpenStreetMap tiles — no API key required.
 * Leaflet CSS is imported here; avoid double-importing it.
 */
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default marker icon paths broken by Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PropertyMap = ({
  // Single-property mode
  lat,
  lng,
  title,
  address,
  // Multi-property mode
  properties = [],
  // Display options
  height = "300px",
  zoom   = 14,
  className = "",
}) => {
  // Determine mode
  const isMulti = properties.length > 0;

  // For single mode
  const center = isMulti
    ? getCenter(properties)
    : [parseFloat(lat), parseFloat(lng)];

  const mapZoom = isMulti && properties.length > 1 ? 13 : zoom;

  // Don't render if no valid coords
  if (!isMulti && (!lat || !lng)) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-high border border-outline-variant rounded-xl text-on-surface-variant text-sm ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-outline block mb-2">location_off</span>
          <p>Location not available for this property</p>
        </div>
      </div>
    );
  }

  if (isMulti && properties.filter(p => p.latitude && p.longitude).length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-high border border-outline-variant rounded-xl text-on-surface-variant text-sm ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-outline block mb-2">map</span>
          <p>No property locations available</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={mapZoom}
      style={{ height, width: "100%", borderRadius: "inherit", zIndex: 0 }}
      className={className}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Single property marker */}
      {!isMulti && lat && lng && (
        <Marker position={[parseFloat(lat), parseFloat(lng)]}>
          <Popup>
            <div className="text-sm font-medium min-w-[160px]">
              <p className="font-bold text-base">{title || "Property"}</p>
              {address && <p className="text-gray-600 mt-0.5 text-xs">{address}</p>}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Multiple property markers */}
      {isMulti && properties
        .filter(p => p.latitude && p.longitude)
        .map(p => (
          <Marker
            key={p.id}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <p className="font-bold">{p.title}</p>
                {p.address && <p className="text-gray-500 text-xs mt-0.5">{p.address}</p>}
                {p.price && (
                  <p className="text-blue-700 font-bold mt-1">Rs. {Number(p.price).toLocaleString()}/mo</p>
                )}
                {p.id && (
                  <a
                    href={`/user/properties/${p.id}`}
                    className="text-blue-600 underline text-xs block mt-1.5"
                  >
                    View property →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))
      }
    </MapContainer>
  );
};

// Compute center from a list of properties that have coordinates
function getCenter(properties) {
  const withCoords = properties.filter(p => p.latitude && p.longitude);
  if (withCoords.length === 0) return [51.505, -0.09];
  const avgLat = withCoords.reduce((s, p) => s + parseFloat(p.latitude), 0) / withCoords.length;
  const avgLng = withCoords.reduce((s, p) => s + parseFloat(p.longitude), 0) / withCoords.length;
  return [avgLat, avgLng];
}

export default PropertyMap;
