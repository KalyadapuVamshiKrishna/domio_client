import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Copy, Share2 } from "lucide-react";
import axios from "axios"; // ✅ import axios

const BookingVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const transactionId = searchParams.get('tx');
  const bookingId = searchParams.get('booking');

  useEffect(() => {
    const verifyBooking = async () => {
      if (!transactionId && !bookingId) {
        setError("No booking reference found in URL");
        setLoading(false);
        return;
      }

      try {
        const params = {};
        if (transactionId) params.tx = transactionId;
        if (bookingId) params.booking = bookingId;

        const { data } = await axios.get("/bookings/verify", { params });

        if (data.success) {
          setBooking(data.booking);
        } else {
          setError(data.error || "Booking not found");
        }
      } catch (err) {
        console.error("Verification error:", err);
        const message =
          err.response?.data?.error ||
          err.message ||
          "Failed to verify booking. Please check your connection.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    verifyBooking();
  }, [transactionId, bookingId]);

  const handleCopy = async (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    if (!booking) return;
    
    const shareText = `Booking Verification\n${getItemTitle()}\nBooking ID: ${booking._id}\nTransaction: ${booking.transactionId}\nStatus: ${booking.status.toUpperCase()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Booking Verification - Domio",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      }
    } else {
      handleCopy(shareText);
    }
  };

  const getItemTitle = () => {
    if (!booking) return "Unknown";
    
    if (booking.type === "place" && booking.place) {
      return booking.place.title || booking.place.name || "Place Booking";
    } else if (booking.item) {
      return booking.item.title || booking.item.name || `${booking.type} Booking`;
    }
    return `${booking.type} Booking`;
  };

  const getItemAddress = () => {
    if (!booking) return null;
    
    if (booking.type === "place" && booking.place) {
      return booking.place.address;
    } else if (booking.item) {
      return booking.item.address;
    }
    return booking.address;
  };

  const formatCurrency = (amount) => `₹${(Number(amount) || 0).toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <XCircle className="mx-auto text-red-500" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          No booking data available
        </div>
      </div>
    );
  }

  const statusConfig = {
    confirmed: {
      icon: <CheckCircle className="text-green-600" size={24} />,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200"
    },
    canceled: {
      icon: <XCircle className="text-red-600" size={24} />,
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200"
    },
    pending: {
      icon: <AlertCircle className="text-yellow-600" size={24} />,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200"
    }
  };

  const currentStatus = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(booking._id)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy ID"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 ${currentStatus.bgColor} ${currentStatus.borderColor} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStatus.icon}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Booking Verification</h1>
                  <p className={`text-sm font-medium ${currentStatus.textColor}`}>
                    Status: {booking.status.toUpperCase()}
                  </p>
                </div>
              </div>
              {booking.refundRequested && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Refund Requested
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Booking Info and Payment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Booking Information</h2>
                  <div className="space-y-3">
                    <InfoItem label="Booking ID" value={booking._id} />
                    <InfoItem label="Transaction ID" value={booking.transactionId || "N/A"} />
                    <InfoItem label="Item" value={getItemTitle()} />
                    <InfoItem label="Type" value={booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} />
                    <InfoItem label="Created" value={format(new Date(booking.createdAt), "dd MMM yyyy, hh:mm a")} />
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3">Guest Details</h3>
                  <div className="space-y-2">
                    <InfoItem label="Name" value={booking.name} />
                    <InfoItem label="Phone" value={booking.phone} />
                    <InfoItem label="Number of Guests" value={booking.numberOfGuests} />
                  </div>
                </div>

                {booking.type === "place" && booking.checkIn && booking.checkOut && (
                  <div>
                    <h3 className="text-md font-semibold mb-3">Stay Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem 
                        label="Check-in" 
                        value={format(new Date(booking.checkIn), "dd MMM yyyy")} 
                      />
                      <InfoItem 
                        label="Check-out" 
                        value={format(new Date(booking.checkOut), "dd MMM yyyy")} 
                      />
                    </div>
                  </div>
                )}

                {(booking.type === "experience" || booking.type === "service") && booking.date && (
                  <div>
                    <h3 className="text-md font-semibold mb-3">Date</h3>
                    <InfoItem 
                      label="Scheduled Date" 
                      value={format(new Date(booking.date), "dd MMM yyyy")} 
                    />
                  </div>
                )}

                {getItemAddress() && (
                  <div>
                    <h3 className="text-md font-semibold mb-3">Location</h3>
                    <InfoItem label="Address" value={getItemAddress()} />
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price</span>
                      <span className="font-semibold">{formatCurrency(booking.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-semibold">{formatCurrency(booking.serviceFee)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total Amount</span>
                        <span className="font-bold text-xl text-green-600">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <InfoItem 
                        label="Payment Method" 
                        value={booking.paymentMethod || "N/A"} 
                      />
                    </div>
                  </div>
                </div>

                
              </div>
            </div>

            {booking.refundRequestedAt && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Refund Information</h3>
                <p className="text-yellow-700 text-sm">
                  Refund requested on {format(new Date(booking.refundRequestedAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable component
const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 text-right w-1/2 break-all">{value}</p>
  </div>
);

export default BookingVerificationPage;
