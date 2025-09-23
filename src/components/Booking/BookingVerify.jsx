import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function VerifyBookingPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking"); // now using bookingId from URL
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID missing in URL.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/bookings/verify?booking=${bookingId}`);
        if (res.data?.success) {
          setBooking(res.data.booking);
        } else {
          setError(res.data?.error || "Booking not found.");
        }
      } catch (err) {
        console.error("Verify booking error:", err);
        setError(err?.response?.data?.error || "Failed to verify booking.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading)
    return <p className="text-center mt-20 text-gray-600">Loading booking details...</p>;

  if (error)
    return (
      <div className="text-center mt-20 text-red-600 flex flex-col items-center gap-2">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );

  // Booking info
  const {
    transactionId,
    numberOfGuests,
    name,
    phone,
    paymentMethod,
    totalPrice,
    checkIn,
    checkOut,
    date,
    itemTitle,
  } = booking;

  const serviceFee = Math.max(50, Math.round(totalPrice * 0.05));
  const grandTotal = totalPrice + serviceFee;

  const formatCurrency = (amt) => `₹${(Number(amt) || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" />
              <div>
                <CardTitle>Booking Verified</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Booking ID: #{bookingId}
                </p>
                {transactionId && (
                  <p className="text-xs text-muted-foreground">
                    Transaction: #{transactionId}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline">Paid</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Booking Summary</h3>
              <div className="text-sm text-muted-foreground">
                <p><strong>{itemTitle}</strong></p>
                {checkIn && checkOut ? (
                  <p>
                    {format(new Date(checkIn), "dd MMM yyyy")} — {format(new Date(checkOut), "dd MMM yyyy")}
                  </p>
                ) : date ? (
                  <p>{format(new Date(date), "dd MMM yyyy")}</p>
                ) : null}
                <p>Guests: {numberOfGuests || 1}</p>
                <p>Payment method: {paymentMethod}</p>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(totalPrice)}</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Service fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Total</span>
                  <strong>{formatCurrency(grandTotal)}</strong>
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <h3 className="font-semibold">Customer Info</h3>
                <p>Name: {name}</p>
                <p>Phone: {phone}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <span>Need help? support@domio.com</span>
          <span>{format(new Date(), "PPP p")}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
