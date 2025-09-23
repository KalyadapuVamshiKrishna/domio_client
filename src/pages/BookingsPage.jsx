import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../components/Account/AccountNav";
import PlaceImg from "../components/Places/PlaceImg";
import BookingDates from "../components/Booking/BookingDates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, X } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    axios
      .get("/bookings", { withCredentials: true })
      .then((response) => {
        setBookings(response.data.bookings); // ✅ updated to match your backend
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/bookings/${id}`, { withCredentials: true });
      setBookings((prev) => prev.filter((b) => b._id !== id));

      setModalMessage(
        "Your booking has been canceled. The refund will be processed in 4 to 7 working days."
      );
      setShowModal(true);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const openConfirmModal = (id) => {
    setSelectedBookingId(id);
    setConfirmModal(true);
  };

  const confirmDelete = () => {
    if (selectedBookingId) {
      handleDelete(selectedBookingId);
    }
    setConfirmModal(false);
    setSelectedBookingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
      <AccountNav />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Your Bookings
        </h1>
      </div>

      {bookings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const location =
              booking.address ||
              (booking.place ? booking.place.address : "Location not available");

            return (
              <Card
                key={booking._id}
                className="flex flex-col rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                {/* Image */}
                {booking.place ? (
                  <PlaceImg
                    place={booking.place}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}

                {/* Card Content */}
                <CardContent className="p-4 flex flex-col justify-between flex-1">
                  {booking.place && (
                    <>
                      <h2 className="text-lg font-semibold mb-2 truncate">
                        {booking.place.title}
                      </h2>
                      <p className="text-gray-600 flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {location}
                      </p>
                    </>
                  )}

                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-800">Booked by:</span>{" "}
                    {booking.name}
                  </p>

                  <BookingDates
                    booking={booking}
                    className="text-sm text-gray-500 mb-3"
                  />

                  {/* Payment & Transaction Info */}
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Payment:</span> {booking.paymentMethod}
                  </p>
                  {booking.transactionId && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">Transaction ID:</span> {booking.transactionId}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-semibold text-rose-500">₹{booking.price}</p>
                    {booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openConfirmModal(booking._id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center mt-12">
          <p className="text-gray-500 text-lg mb-4">No bookings yet.</p>
          <Button asChild>
            <a href="/" className="bg-rose-500 text-white hover:bg-rose-600">
              Browse Listings
            </a>
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setConfirmModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Cancel Booking?
            </h3>
            <p className="text-gray-600">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setConfirmModal(false)}>
                No, Keep it
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              Booking Canceled
            </h3>
            <p className="text-gray-600">{modalMessage}</p>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
