import PhotosUploader from "../components/Places/PhotosUploader.jsx";
import Perks from "../components/Places/Perks.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../components/Account/AccountNav.jsx";
import { Navigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X } from "lucide-react";

export default function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
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
    });
  }, [id]);

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title,
      address,
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
    <div className="px-4 sm:px-6 lg:px-8">
      <AccountNav />
      <form
        className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md mt-6 space-y-8"
        onSubmit={savePlace}
      >
        {/* ✅ Title */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">
            Title <span className="text-gray-500 text-sm font-normal">(Short and catchy)</span>
          </Label>
          <Input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="My lovely apartment"
            required
          />
        </div>

        {/* ✅ Address */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Address</Label>
          <Input
            type="text"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
            placeholder="123 Main St, City"
            required
          />
        </div>

        {/* ✅ Photos */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Photos</Label>
          <p className="text-gray-500 text-sm mb-3">Add more photos for better visibility</p>
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        </div>

        {/* ✅ Description */}
        <div>
          <Label className="text-lg font-semibold mb-2 block">Description</Label>
          <Textarea
            value={description}
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
