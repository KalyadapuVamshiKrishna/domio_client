// src/components/forms/LocationSection.jsx
import React, { useMemo, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Map click handler
function MapEvents({ setCoordinates, handleReverseGeocode }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoordinates({ lat, lng });
      handleReverseGeocode(lat, lng);
    },
  });
  return null;
}

// Draggable marker with reverse geocoding on drag end
const DraggableMarker = ({ coordinates, setCoordinates, handleReverseGeocode }) => {
  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const { lat, lng } = e.target.getLatLng();
        setCoordinates({ lat, lng });
        handleReverseGeocode(lat, lng);
      },
    }),
    [setCoordinates, handleReverseGeocode]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[coordinates.lat, coordinates.lng]}
    />
  );
};

// Recenter map when coordinates change
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const LocationSection = ({
  address,
  setAddress,
  coordinates,
  setCoordinates,
  city,
  setCity,
  state,
  setState,
  country,
  setCountry,
}) => {

  // ✅ Reverse Geocode Function (get city/state/country)
  const handleReverseGeocode = async (lat, lng) => {
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      if (data) {
        const displayAddress = data.display_name || "";
        const addressData = data.address || {};

        setAddress(displayAddress);
        setCity(addressData.city || addressData.town || addressData.village || "");
        setState(addressData.state || "");
        setCountry(addressData.country || "");
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err.message);
    }
  };

  // ✅ Search function (geocoding)
  const handleSearch = async () => {
    if (!address.trim()) return;
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setAddress(display_name);
        await handleReverseGeocode(lat, lon);
      } else {
        alert("Location not found. Please try another search term.");
      }
    } catch (error) {
      console.error("Search error:", error.message);
      alert("Failed to search location. Please try again.");
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div>
      {/* Search Input & Button */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for an address..."
            className="pl-10"
          />
        </div>
        <Button type="button" onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      {/* Leaflet Map */}
      <div className="border rounded-lg overflow-hidden mb-3">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-80"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            handleReverseGeocode={handleReverseGeocode}
          />
          <MapEvents
            setCoordinates={setCoordinates}
            handleReverseGeocode={handleReverseGeocode}
          />
          <RecenterAutomatically lat={coordinates.lat} lng={coordinates.lng} />
        </MapContainer>
      </div>

      {/* Display Selected Address/Coordinates */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <Label className="text-sm font-medium text-gray-600">
          Selected Address:
        </Label>
        <p className="text-sm text-gray-800 mt-1">
          {address || "No location selected"}
        </p>
        {coordinates && (
          <p className="text-xs text-gray-500 mt-1">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        )}
        {(city || state || country) && (
          <div className="text-xs text-gray-600 mt-2">
            <p>City: {city || "N/A"}</p>
            <p>State: {state || "N/A"}</p>
            <p>Country: {country || "N/A"}</p>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-xs mt-2">
        💡 Tip: Type an address and search, or drag the pin for precise positioning.
      </p>
    </div>
  );
};

export default LocationSection;
