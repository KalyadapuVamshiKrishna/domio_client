import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { Trash2, AlertCircle, Loader2 } from "lucide-react"; // Added Icons

import PlaceFormSection from "../components/forms/PlaceFormSection";
import Perks from "../components/Perks";
import LocationSection from "../components/forms/LocationSection";
import DateTimePriceSection from "../components/forms/DateTimePriceSection";
import DeleteConfirmationModal from "../components/forms/DeleteConfirmationModal";
import PhotosUploader from "../components/PhotoUploader";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Leaflet setup...
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function PlacesFormPage() {
  const { id } = useParams();

  // ✅ Core state
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.209 });
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(1000);
  
  // ✅ Status States
  const [redirect, setRedirect] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New: Prevents double submit
  const [isLoading, setIsLoading] = useState(!!id); // New: Show loader on init
  
  // ✅ Error States
  const [errors, setErrors] = useState({}); // Field-specific errors
  const [globalError, setGlobalError] = useState(null); // General API errors

  // ✅ Reverse Geocode
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const { data } = await axios.get(`/reverse-geocode?lat=${lat}&lon=${lng}`);
      if (data) {
        setAddress(data.display_name || "Unknown location");
        setCity(data.city || data.town || data.village || "");
        setState(data.state || "");
        setCountry(data.country || "");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      // Don't block the user, just log it
    }
  }, []);

  // ✅ Load data if editing
  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    axios.get(`/places/${id}`, { withCredentials: true })
      .then((response) => {
        const { data } = response;
        setTitle(data.title);
        setAddress(data.address);
        setAddedPhotos(data.photos || []);
        setDescription(data.description || "");
        setPerks(data.perks || []);
        setExtraInfo(data.extraInfo || "");
        setCheckIn(data.checkIn || "");
        setCheckOut(data.checkOut || "");
        setMaxGuests(data.maxGuests || 1);
        setPrice(data.price || 1000);
        setCity(data.city || "");
        setState(data.state || "");
        setCountry(data.country || "");
        if (data.coordinates?.lat && data.coordinates?.lng) {
          setCoordinates(data.coordinates);
        }
      })
      .catch(err => {
         setGlobalError("Failed to load place details. Please refresh."+ err);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // ✅ Client-side Validation
  function validateForm() {
    const newErrors = {};
    if (!title.trim()) newErrors.title = ["Title is required"];
    if (!address.trim()) newErrors.address = ["Address is required"];
    if (addedPhotos.length < 3) newErrors.photos = ["Add at least 3 photos"];
    if (!description.trim()) newErrors.description = ["Description is required"];
    if (!checkIn) newErrors.checkIn = ["Check-in time is required"];
    if (!checkOut) newErrors.checkOut = ["Check-out time is required"];
    if (price < 1) newErrors.price = ["Price must be positive"];
    if (maxGuests < 1) newErrors.maxGuests = ["Guests must be at least 1"];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ✅ Save place (POST/PUT)
  async function savePlace(ev) {
    ev.preventDefault();
    setGlobalError(null);
    setErrors({});

    // 1. Run Client Validation
    if (!validateForm()) {
      setGlobalError("Please fix the highlighted errors below.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    const placeData = {
      title, address, coordinates, photos: addedPhotos,
      description, perks, extraInfo, checkIn, checkOut,
      maxGuests: Number(maxGuests),
      price: Number(price),
      city, state, country,
    };

    try {
      if (id) {
        await axios.put(`/places/${id}`, placeData, { withCredentials: true });
      } else {
        await axios.post("/places", placeData, { withCredentials: true });
      }
      setRedirect(true);
    } catch (e) {
      console.error("Save Error:", e);
      
      // 2. Handle Server Validation Errors (400/422)
      if (e.response && (e.response.status === 400 || e.response.status === 422)) {
        if (e.response.data.details) {
            setErrors(e.response.data.details); // Assuming backend sends { details: { title: "Error" } }
        } else {
             setGlobalError(e.response.data.error || "Validation failed.");
        }
      } else {
        // 3. Handle Network/Server Crash (500)
        setGlobalError("Something went wrong on our end. Please try again later.");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }

  // ✅ Delete place
  async function deletePlace() {
    if (!id) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/places/${id}`, { withCredentials: true });
      setRedirect(true);
    } catch (error) {
      setGlobalError("Failed to delete place. It might be booked."+error);
      setConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (redirect) return <Navigate to="/account/places" />;

  // Loading State
  if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-10 h-10 text-rose-500" /></div>;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* ✅ Global Error Banner */}
      {globalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{globalError}</p>
        </div>
      )}

      <form className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8" onSubmit={savePlace}>
        
        {/* Title */}
        <PlaceFormSection title="Title" subtitle="(Short and catchy)" error={errors.title}>
          <Input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="e.g., Cozy Cottage in the Hills"
            className={errors.title ? "border-red-500 focus-visible:ring-red-200" : ""}
          />
        </PlaceFormSection>

        {/* Location */}
        <PlaceFormSection title="Location" subtitle="(Search and pin your exact location)" error={errors.address}>
          <LocationSection
            address={address} setAddress={setAddress}
            coordinates={coordinates} setCoordinates={setCoordinates}
            city={city} setCity={setCity}
            state={state} setState={setState}
            country={country} setCountry={setCountry}
            reverseGeocode={reverseGeocode}
          />
        </PlaceFormSection>

        {/* Photos */}
        <PlaceFormSection title="Photos" subtitle="Add at least 3 photos" error={errors.photos}>
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        </PlaceFormSection>

        {/* Description */}
        <PlaceFormSection title="Description" error={errors.description}>
          <Textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Describe your place..."
            rows={5}
            className={errors.description ? "border-red-500 focus-visible:ring-red-200" : ""}
          />
        </PlaceFormSection>

        {/* Perks */}
        <PlaceFormSection title="Perks" subtitle="Select available amenities" error={errors.perks}>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mt-2">
            <Perks selected={perks} onChange={setPerks} />
          </div>
        </PlaceFormSection>

        {/* Extra Info */}
        <PlaceFormSection title="Extra info" subtitle="House rules, etc." error={errors.extraInfo}>
          <Textarea
            value={extraInfo}
            onChange={(ev) => setExtraInfo(ev.target.value)}
            placeholder="Any extra info..."
            rows={4}
          />
        </PlaceFormSection>

        {/* Check-in/out & Price */}
        <PlaceFormSection title="Details" subtitle="Check-in/out times & Pricing">
          <DateTimePriceSection
            checkIn={checkIn} setCheckIn={setCheckIn}
            checkOut={checkOut} setCheckOut={setCheckOut}
            maxGuests={maxGuests} setMaxGuests={setMaxGuests}
            price={price} setPrice={setPrice}
            errors={errors} // Pass errors down to highlight specific inputs
          />
        </PlaceFormSection>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
          {id && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setConfirmModal(true)}
              disabled={isSaving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Place
            </Button>
          )}
          
          <Button
            className="w-full sm:w-auto sm:ml-auto bg-rose-500 hover:bg-rose-600 text-white min-w-[150px]"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Property"
            )}
          </Button>
        </div>
      </form>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={deletePlace}
        isDeleting={isDeleting}
      />
    </div>
  );
}