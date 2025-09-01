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
  const [modalMessage, setModalMessage] = useState(""); // Message for modal
  const [showModal, setShowModal] = useState(false);    // Modal visibility

  useEffect(() => {
    axios.get("/bookings").then((response) => {
      setBookings(response.data);
    });
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));

      // Show modal after deletion
      setModalMessage(
        "Your booking has been canceled. The refund will be processed in 4 to 7 working days."
      );
      setShowModal(true);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <AccountNav />

      <h1 className="text-2xl font-bold mb-6 text-center">Your Bookings</h1>

      {bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const location =
              booking.address || (booking.place ? booking.place.address : "Location not available");

            return (
              <Card
                key={booking._id}
                className="flex flex-col shadow-md hover:shadow-xl transition rounded-xl overflow-hidden"
              >
                {booking.place ? (
                  <PlaceImg place={booking.place} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}

                <CardContent className="p-4 flex flex-col justify-between flex-1">
                  {booking.place ? (
                    <>
                      <h2 className="text-lg font-semibold mb-2 truncate">{booking.place.title}</h2>
                      <p className="text-gray-600 flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {location}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 mb-3">{location}</p>
                  )}

                  <BookingDates booking={booking} className="text-sm text-gray-500 mb-3" />

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-semibold text-primary">₹{booking.price}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(booking._id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No bookings yet.</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Booking Canceled</h3>
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
