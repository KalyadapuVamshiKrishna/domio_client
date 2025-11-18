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

  // Cancel booking modal states
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  /* ======================================
       FETCH BOOKINGS
  ====================================== */
  useEffect(() => {
    axios
      .get("/bookings", { withCredentials: true })
      .then((response) => {
        setBookings(response.data.bookings || []);
      })
      .catch((err) => console.error("Fetch bookings error:", err));
  }, []);

  /* ======================================
       CANCEL BOOKING
  ====================================== */
  const handleCancel = async (id) => {
    try {
      await axios.delete(`/bookings/${id}`, { withCredentials: true });

      setBookings((prev) => prev.filter((b) => b._id !== id));

      setModalMessage(
        "Your booking has been canceled. The refund will be processed in 4 to 7 working days."
      );
      setShowModal(true);
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  const openCancelConfirm = (id) => {
    setSelectedBookingId(id);
    setConfirmModal(true);
  };

  const confirmCancel = () => {
    if (selectedBookingId) handleCancel(selectedBookingId);
    setConfirmModal(false);
    setSelectedBookingId(null);
  };

  /* ======================================
      SUBMIT REVIEW
  ====================================== */
  const submitReview = async () => {
    if (!selectedBookingForReview) return;

    try {
      await axios.post(
        `/bookings/${selectedBookingForReview._id}/review`,
        { rating, reviewText },
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBookingForReview._id
            ? { ...b, reviewSubmitted: true }
            : b
        )
      );

      setShowReviewModal(false);
      setRating(0);
      setReviewText("");
      setSelectedBookingForReview(null);
    } catch (err) {
      console.error("Review submission error:", err);
    }
  };

  /* ======================================
       RENDER
  ====================================== */
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
      <AccountNav />

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-gray-500 text-lg mb-4">No bookings yet.</p>
          <Button asChild>
            <a href="/" className="bg-rose-500 text-white hover:bg-rose-600">
              Browse Listings
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const location =
              booking.address ||
              booking.place?.address ||
              "Location not available";

            const now = new Date();
            const checkout = new Date(booking.checkOut);

            const isEligibleForReview =
              checkout < now &&
              booking.status !== "canceled" &&
              !booking.reviewSubmitted;

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
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Content */}
                <CardContent className="p-4 flex flex-col flex-1">
                  {booking.place && (
                    <>
                      <h2 className="text-lg font-semibold truncate">
                        {booking.place.title}
                      </h2>

                      <p className="text-gray-600 flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {location}
                      </p>
                    </>
                  )}

                  <p className="text-sm mb-2">
                    <span className="font-medium">Booked by:</span>{" "}
                    {booking.name}
                  </p>

                  <BookingDates booking={booking} className="mb-3" />

                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Payment:</span>{" "}
                    {booking.paymentMethod}
                  </p>

                  {booking.transactionId && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {booking.transactionId}
                    </p>
                  )}

                  {/* Modern Action Row */}
                  <div className="mt-4 flex items-center justify-between">

                    {/* Price badge */}
                    <span className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-600 font-medium text-sm shadow-sm">
                      ₹{booking.price}
                    </span>

                    {/* Action Button */}
                    {(() => {
                      if (isEligibleForReview) {
                        return (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBookingForReview(booking);
                              setShowReviewModal(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
                          >
                            Rate Stay
                          </Button>
                        );
                      }

                      if (booking.status === "confirmed") {
                        return (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openCancelConfirm(booking._id)}
                            className="px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </Button>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* -------------------- CANCEL CONFIRM MODAL -------------------- */}
      {confirmModal && (
        <Overlay>
          <Modal>
            <Close onClick={() => setConfirmModal(false)} />

            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Cancel Booking?
            </h3>
            <p className="text-gray-600">
              Are you sure you want to cancel this booking?
            </p>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setConfirmModal(false)}>
                No, Keep it
              </Button>
              <Button variant="destructive" onClick={confirmCancel}>
                Yes, Cancel
              </Button>
            </div>
          </Modal>
        </Overlay>
      )}

      {/* -------------------- CANCEL SUCCESS MODAL -------------------- */}
      {showModal && (
        <Overlay>
          <Modal>
            <Close onClick={() => setShowModal(false)} />

            <h3 className="text-lg font-semibold mb-4 text-green-600">
              Booking Canceled
            </h3>
            <p className="text-gray-600">{modalMessage}</p>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </Modal>
        </Overlay>
      )}

      {/* -------------------- REVIEW MODAL -------------------- */}
      {showReviewModal && (
        <Overlay>
          <Modal>
            <Close onClick={() => setShowReviewModal(false)} />

            <h3 className="text-xl font-semibold mb-4">Rate Your Stay</h3>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`text-3xl ${
                    rating >= num ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              className="w-full border p-3 rounded-lg text-sm"
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <Button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={submitReview}
            >
              Submit Review
            </Button>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

/* ======================================================
   SIMPLE WRAPPER COMPONENTS
====================================================== */
const Overlay = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    {children}
  </div>
);

const Modal = ({ children }) => (
  <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
    {children}
  </div>
);

const Close = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
  >
    <X className="w-5 h-5" />
  </button>
);
