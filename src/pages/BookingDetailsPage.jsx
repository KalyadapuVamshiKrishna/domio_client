// src/pages/BookingDetailsPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";

// Import reusable components
import PlaceFormSection from "../components/forms/PlaceFormSection";
import PhotosUploader from "../components/PhotoUploader";
import Perks from "../components/Perks";
import LocationSection from "../components/forms/LocationSection";
import DateTimePriceSection from "../components/forms/DateTimePriceSection";
import DeleteConfirmationModal from "../components/forms/DeleteConfirmationModal";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------- //
// NOTE: The Leaflet Marker FIX logic should stay here or in a setup file
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
// ---------------------------------------------------------------- //

export default function BookingDetailsPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: 28.6139,
    lng: 77.209,
  }); // Default: New Delhi
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(1000);
  const [redirect, setRedirect] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  // ----------------- API Logic -----------------

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const { data } = await axios.get(`/reverse-geocode?lat=${lat}&lon=${lng}`);
      setAddress(data.display_name || "Unknown location");
    } catch (error) {
      console.error(
        "Reverse geocoding error:",
        error.response?.data || error.message
      );
      setAddress("Could not fetch address");
    }
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .get(`/places/${id}`, { withCredentials: true })
        .then((response) => {
          const { data } = response;
          setTitle(data.title);
          setAddress(data.address);
          setAddedPhotos(data.photos);
          setDescription(data.description);
          setPerks(data.perks);
          setExtraInfo(data.extraInfo);
          setCheckIn(data.checkIn);
          setCheckOut(data.checkOut);
          setMaxGuests(data.maxGuests);
          setPrice(data.price);
          if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
            setCoordinates(data.coordinates);
          }
        });
    } else {
      reverseGeocode(coordinates.lat, coordinates.lng);
    }
  }, [id, reverseGeocode]);

  async function savePlace(ev) {
    ev.preventDefault();
    setErrors({});
    const placeData = {
      title,
      address,
      coordinates,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };

    try {
      if (id) {
        await axios.put(`/places/${id}`, placeData, { withCredentials: true });
      } else {
        await axios.post("/places", placeData, { withCredentials: true });
      }
      setRedirect(true);
    } catch (e) {
      console.error("Save place error:", e.response?.data || e.message);
      if (e.response?.data?.details) {
        setErrors(e.response.data.details);
      } else {
        alert(e.response?.data?.error || "Failed to save. Please try again.");
      }
    }
  }

  async function deletePlace() {
    if (!id) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/places/${id}`, { withCredentials: true });
      setRedirect(true);
    } catch (error) {
      console.error("Error deleting place:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmModal(false);
    }
  }

  if (redirect) return <Navigate to={"/account/places"} />;

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <form
        className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md mt-6 space-y-8"
        onSubmit={savePlace}
      >
        {/* 1. Title */}
        <PlaceFormSection
          title="Title"
          subtitle="(Short and catchy)"
          error={errors.title}
        >
          <Input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="My lovely apartment"
            required
          />
        </PlaceFormSection>

        {/* 2. Location */}
        <PlaceFormSection
          title="Location"
          subtitle="(Search and pin your exact location)"
          error={errors.address}
        >
          <LocationSection
            address={address}
            setAddress={setAddress}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            reverseGeocode={reverseGeocode}
          />
        </PlaceFormSection>

        {/* 3. Photos */}
        <PlaceFormSection
          title="Photos"
          subtitle="Add more photos for better visibility"
          error={errors.photos}
        >
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        </PlaceFormSection>

        {/* 4. Description */}
        <PlaceFormSection title="Description" error={errors.description}>
          <Textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Describe your place..."
            rows={5}
            required
          />
        </PlaceFormSection>

        {/* 5. Perks */}
        <PlaceFormSection
          title="Perks"
          subtitle="Select all perks available at your place"
          error={errors.perks}
        >
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 mt-2">
            <Perks selected={perks} onChange={setPerks} />
          </div>
        </PlaceFormSection>

        {/* 6. Extra Info */}
        <PlaceFormSection
          title="Extra info"
          subtitle="House rules, additional info, etc."
          error={errors.extraInfo}
        >
          <Textarea
            value={extraInfo}
            onChange={(ev) => setExtraInfo(ev.target.value)}
            placeholder="Any extra info..."
            rows={4}
          />
        </PlaceFormSection>

        {/* 7. Check-in/out & Price */}
        <PlaceFormSection
          title="Check-in & out times & Price"
          subtitle="Set check-in/out times, max guests, and price per night"
        >
          <DateTimePriceSection
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            maxGuests={maxGuests}
            setMaxGuests={setMaxGuests}
            price={price}
            setPrice={setPrice}
            errors={errors}
          />
        </PlaceFormSection>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4">
          {id && (
            <Button
              variant="destructive"
              type="button"
              onClick={() => setConfirmModal(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
          <Button
            className="px-6 py-3 text-base font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white ml-auto"
            type="submit"
          >
            Save Place
          </Button>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mt-4">
            <p className="font-semibold mb-1">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-sm">
              {Object.entries(errors).map(([field, messages]) => (
                <li key={field}>{messages[0]}</li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={deletePlace}
        isDeleting={isDeleting}
      />
    </div>
  );
}
