import PhotosUploader from "../components/Places/PhotosUploader.jsx";
import Perks from "../components/Places/Perks.jsx";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AccountNav from "../components/Account/AccountNav.jsx";
import { Navigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, MapPin, Search } from "lucide-react";

export default function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
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

  // Google Maps state
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return;
    }

    // Get API key from environment variables (for production) or use a placeholder
    const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || 
                   (typeof process !== 'undefined' && process.env?.REACT_APP_GOOGLE_MAPS_API_KEY) || 
                   'YOUR_API_KEY_HERE';
    
    if (apiKey === 'YOUR_API_KEY_HERE') {
      console.error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
      alert('Google Maps API key not configured. Please contact the administrator.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      alert('Failed to load Google Maps. Please check your API key configuration.');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || map) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const markerInstance = new window.google.maps.Marker({
      position: coordinates,
      map: mapInstance,
      draggable: true,
      title: "Property Location"
    });

    // Handle marker drag
    markerInstance.addListener('dragend', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setCoordinates({ lat, lng });
      
      // Reverse geocoding to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    });

    // Handle map click
    mapInstance.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setCoordinates({ lat, lng });
      markerInstance.setPosition({ lat, lng });
      
      // Reverse geocoding to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [isMapLoaded, coordinates, map]);

  // Handle search
  const handleSearch = () => {
    if (!searchInput.trim() || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setCoordinates({ lat, lng });
        setAddress(results[0].formatted_address);
        
        if (map && marker) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
          marker.setPosition({ lat, lng });
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    if (!id) return;
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
      
      // Set coordinates if available
      if (data.coordinates) {
        setCoordinates(data.coordinates);
      }
    });
  }, [id]);

  // Update map when coordinates change from API
  useEffect(() => {
    if (map && marker && coordinates) {
      map.setCenter(coordinates);
      marker.setPosition(coordinates);
    }
  }, [map, marker, coordinates]);

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title,
      address,
      coordinates, // Include coordinates in save data
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
      alert("Failed to save. Please try again.");
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
        {/* ✅ Title */}
        <div>
          <Label htmlFor="title" className="text-lg font-semibold mb-2 block">
            Title <span  className="text-gray-500 text-sm font-normal">(Short and catchy)</span>
          </Label>
          <Input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="My lovely apartment"
            required
          />
        </div>

        {/* ✅ Location with Google Maps */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">
            Location <span className="text-gray-500 text-sm font-normal">(Search and pin your exact location)</span>
          </Label>
          
          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={searchInput}
                onChange={(ev) => setSearchInput(ev.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search for a location..."
                className="pl-10"
              />
            </div>
            <Button type="button" onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>

          {/* Google Maps */}
          <div className="border rounded-lg overflow-hidden mb-3">
            <div 
              ref={mapRef}
              className="w-full h-80"
              style={{ minHeight: '320px' }}
            >
              {!isMapLoaded && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Address Display */}
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
            💡 Tip: Search for your location, then drag the red pin or click on the map for precise positioning
          </p>
        </div>

        {/* ✅ Photos */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Photos</Label>
          <p className="text-gray-500 text-sm mb-3">Add more photos for better visibility</p>
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        </div>

        {/* ✅ Description */}
        <div>
          <Label  htmlFor="description" className="text-lg font-semibold mb-2 block">Description</Label>
          <Textarea
            value={description}
            id="description"
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Describe your place..."
            rows={5}
            required
          />
        </div>

        {/* ✅ Perks */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Perks</Label>
          <p className="text-gray-500 text-sm mb-3">Select all perks available at your place</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 mt-2">
            <Perks selected={perks} onChange={setPerks} />
          </div>
        </div>

        {/* ✅ Extra Info */}
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

        {/* ✅ Check-in/out & Price */}
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
            </div>
          </div>
        </div>

        {/* ✅ Buttons */}
        <div className="flex justify-between items-center">
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
            className="px-6 py-3 text-base font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white"
            type="submit"
          >
            Save Place
          </Button>
        </div>
      </form>

      {/* ✅ Delete Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setConfirmModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Place?</h3>
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