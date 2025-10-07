import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, MapPin, Search, UploadCloud, Wifi, ParkingSquare, UtensilsCrossed, Tv, Wind, PawPrint } from "lucide-react";

// --- STANDARD LEAFLET.JS IMPORTS ---
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PhotosUploader from './../components/PhotoUploader';




const Perks = ({ selected, onChange }) => {
  const perksList = [
    { name: 'wifi', icon: <Wifi/>, label: 'Wi-Fi' },
    { name: 'parking', icon: <ParkingSquare/>, label: 'Free parking' },
    { name: 'kitchen', icon: <UtensilsCrossed/>, label: 'Kitchen' },
    { name: 'tv', icon: <Tv/>, label: 'TV' },
    { name: 'ac', icon: <Wind/>, label: 'Air Conditioning' },
    { name: 'pets', icon: <PawPrint/>, label: 'Pets allowed' },
  ];

  function handleCbClick(ev) {
    const { checked, name } = ev.target;
    if (checked) {
      onChange([...selected, name]);
    } else {
      onChange(selected.filter(selectedName => selectedName !== name));
    }
  }

  return (
    <>
        {perksList.map(perk => (
             <label key={perk.name} className="border p-4 flex rounded-2xl gap-2 items-center cursor-pointer">
                <input type="checkbox" checked={selected.includes(perk.name)} name={perk.name} onChange={handleCbClick} />
                {perk.icon}
                <span>{perk.label}</span>
             </label>
        ))}
    </>
  );
};


// --- FIX FOR DEFAULT LEAFLET MARKER ICON ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});


  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const { data } = await axios.get(`/reverse-geocode?lat=${lat}&lon=${lng}`);
      setAddress(data.display_name || "Unknown location");
    } catch (error) {
      console.error("Reverse geocoding error:", error.response?.data || error.message);
      setAddress("Could not fetch address");
    }
  }, []);

  useEffect(() => {
    if (id) {
      axios.get(`/places/${id}`, { withCredentials: true }).then((response) => {
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

  function MapEvents() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
      },
    });
    return null;
  }

  const DraggableMarker = () => {
    const eventHandlers = useMemo(
      () => ({
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          setCoordinates({ lat, lng });
          reverseGeocode(lat, lng);
        },
      }),
      [reverseGeocode],
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[coordinates.lat, coordinates.lng]}
      />
    );
  };
  
  function RecenterAutomatically({lat, lng}) {
    const map = useMap();
     useEffect(() => {
       map.setView([lat, lng]);
     }, [lat, lng, map]);
     return null;
  }

  const handleSearch = async () => {
    if (!address.trim()) return;
    try {
      const { data } = await axios.get(`/search-location?q=${encodeURIComponent(address)}`);
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setAddress(display_name);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error("Geocoding search error:", error.response?.data || error.message);
      alert('Failed to search for location. Please try again.');
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

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
      // If backend sent field-level errors
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
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-lg font-semibold mb-2 block">
            Title <span className="text-gray-500 text-sm font-normal">(Short and catchy)</span>
          </Label>
          <Input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="My lovely apartment"
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
        </div>

        {/* Location with Leaflet.js Map */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">
            Location <span className="text-gray-500 text-sm font-normal">(Search and pin your exact location)</span>
          </Label>
          
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
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker />
                <MapEvents />
                <RecenterAutomatically lat={coordinates.lat} lng={coordinates.lng} />
            </MapContainer>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <Label className="text-sm font-medium text-gray-600">Selected Address:</Label>
            <p className="text-sm text-gray-800 mt-1">
              {address || "No location selected"}
            </p>
            {coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          <p className="text-gray-500 text-xs mt-2">
            💡 Tip: Type an address and search, or drag the pin for precise positioning.
          </p>
        </div>

        {/* Photos */}
         <div>
          <Label className="text-lg font-semibold mb-2 block">Photos</Label>
          <p className="text-gray-500 text-sm mb-3">Add more photos for better visibility</p>
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-lg font-semibold mb-2 block">Description</Label>
          <Textarea
            value={description}
            id="description"
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Describe your place..."
            rows={5}
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
        </div>

        {/* Perks */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Perks</Label>
          <p className="text-gray-500 text-sm mb-3">Select all perks available at your place</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 mt-2">
            <Perks selected={perks} onChange={setPerks} />
          </div>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
        </div>

        {/* Extra Info */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Extra info</Label>
          <p className="text-gray-500 text-sm mb-3">House rules, additional info, etc.</p>
          <Textarea
            value={extraInfo}
            onChange={(ev) => setExtraInfo(ev.target.value)}
            placeholder="Any extra info..."
            rows={4}
          />
        </div>

        {/* Check-in/out & Price */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">
            Check-in & out times
          </Label>
          <p className="text-gray-500 text-sm mb-3">
            Set check-in/out times and allow cleaning buffer
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label>Check in</Label>
              <Input
                type="text"
                value={checkIn}
                onChange={(ev) => setCheckIn(ev.target.value)}
                placeholder="14"
                required
              />
              {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn[0]}</p>}
            </div>
            <div>
              <Label>Check out</Label>
              <Input
                type="text"
                value={checkOut}
                onChange={(ev) => setCheckOut(ev.target.value)}
                placeholder="11"
                required
              />
              {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut[0]}</p>}

            </div>
            <div>
              <Label>Max guests</Label>
              <Input
                type="number"
                value={maxGuests}
                onChange={(ev) => setMaxGuests(ev.target.value)}
                min={1}
                required
              />
              {errors.maxGuests && <p className="text-red-500 text-sm mt-1">{errors.maxGuests[0]}</p>}

            </div>
            <div>
              <Label>Price per night</Label>
              <Input
                type="number"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                min={1}
                required
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
          </div>
        </div>

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

        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg relative animate-in zoom-in-95">
            <button
              onClick={() => setConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this place? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deletePlace}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}