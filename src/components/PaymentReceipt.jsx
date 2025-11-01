import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Mail, CheckCircle, Share2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function PaymentReceipt() {
  const [paymentDone, setPaymentDone] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const qrRef = useRef(null);
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  const {
    type,
    itemId,
    itemTitle,
    checkIn,
    checkOut,
    selectedDate,
    numberOfGuests,
    name,
    phone,
    totalPrice,
    userName,
    userEmail,
    paymentMethod = "Test Gateway",
  } = locationState;

 
  const calculatePricing = () => {
    const basePrice = Number(totalPrice) || 0;
    
    
    let subtotal = basePrice;
    
 
    if (type !== "place") {
      
      subtotal = basePrice;
    }
    
    const serviceFee = Math.max(50, Number((subtotal * 0.05).toFixed(2)));
    const grandTotal = subtotal + serviceFee;
    
    return { subtotal, serviceFee, grandTotal };
  };

  const { subtotal, serviceFee, grandTotal } = calculatePricing();
  const dateNow = format(new Date(), "PPP p");

  const formatCurrency = (amt) => `₹${(Number(amt) || 0).toLocaleString()}`;

  // ===== Create Booking and Process Payment =====
  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Prepare payload to match backend expectations
      const bookingPayload = {
        type,
        itemId,
        numberOfGuests: Number(numberOfGuests) || 1,
        name: name?.trim(),
        phone: phone?.trim(),
        paymentMethod,
      };

      // Add date fields based on type
      if (type === "place") {
        if (!checkIn || !checkOut) {
          throw new Error("Check-in and check-out dates are required for place bookings");
        }
        bookingPayload.checkIn = checkIn;
        bookingPayload.checkOut = checkOut;
      } else if (type === "experience" || type === "service") {
        if (!selectedDate) {
          throw new Error("Date is required for experience/service bookings");
        }
        bookingPayload.date = selectedDate;
      }

      // Validate required fields
      if (!bookingPayload.name || !bookingPayload.phone) {
        throw new Error("Name and phone are required");
      }

      console.log("Sending booking payload:", bookingPayload);

      // Create booking (backend will auto-confirm for demo)
      const response = await axios.post("/bookings", bookingPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.success) {
        const booking = response.data.booking;
        setBookingId(booking._id);
        setTransactionId(booking.transactionId);
        setPaymentDone(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        throw new Error(response.data.error || "Booking creation failed");
      }
    } catch (err) {
      console.error("Payment/Booking error:", err);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message) {
        // Validation or other error
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // ===== QR code value =====
 // PaymentReceipt.jsx
 const qrValue = transactionId
      ? `${window.location.origin}/verify?tx=${transactionId}`
     : `${window.location.origin}`;

  // ===== PDF Download =====
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      doc.setFontSize(18);
      doc.text("DOMIO", 40, 60);
      doc.setFontSize(12);
      doc.text("Payment Receipt", 40, 80);

      const startY = 110;
      doc.setFontSize(10);
      doc.text(`Date: ${dateNow}`, 40, startY);
      doc.text(`Booking ID: ${bookingId || "-"}`, 40, startY + 16);
      doc.text(`Transaction ID: ${transactionId || "-"}`, 40, startY + 32);
      doc.text(`Paid by: ${userName || name || "-"}`, 40, startY + 48);
      doc.text(`Email: ${userEmail || "-"}`, 40, startY + 64);

      let y = startY + 100;
      doc.setFontSize(12);
      doc.text("Booking Details:", 40, y);
      
      y += 20;
      doc.setFontSize(10);
      doc.text("Description", 40, y);
      doc.text("Amount", doc.internal.pageSize.width - 140, y);

      y += 18;
      doc.text(itemTitle || "Booking", 40, y);
      doc.text(formatCurrency(subtotal), doc.internal.pageSize.width - 140, y);

      y += 18;
      doc.text("Service Fee", 40, y);
      doc.text(formatCurrency(serviceFee), doc.internal.pageSize.width - 140, y);

      y += 18;
      doc.setFontSize(12);
      doc.text("Total Paid", 40, y);
      doc.text(formatCurrency(grandTotal), doc.internal.pageSize.width - 140, y);

      // Add QR code if available
      const canvas = document.getElementById("payment-qr-canvas");
      if (canvas) {
        try {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", doc.internal.pageSize.width - 170, 40, 120, 120);
        } catch (imgError) {
          console.warn("Could not add QR code to PDF:", imgError);
        }
      }

      doc.save(`Domio_receipt_${bookingId || Date.now()}.pdf`);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const handleCopy = async () => {
    if (!bookingId) return;
    try {
      await navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Failed to copy booking ID");
    }
  };

  const handleSendEmail = async () => {
    if (!userEmail || !bookingId) {
      setError("Email address and booking ID are required");
      return;
    }
    
    setEmailSending(true);
    setError(null);
    
    try {
      const response = await axios.post("/bookings/send-receipt", {
        email: userEmail,
        bookingId: bookingId,
      });

      if (response.data.success) {
        setEmailSent(true);
      } else {
        throw new Error(response.data.error || "Failed to send email");
      }
    } catch (err) {
      console.error("Email send error:", err);
      setError(err.response?.data?.error || "Failed to send receipt email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = async () => {
    if (!bookingId || !transactionId) return;
    
    const bookingUrl = `${window.location.origin}/verify?tx=${transactionId}`;
    const shareText = `Booking Receipt\n${itemTitle || "Booking"}\nTotal: ${formatCurrency(grandTotal)}\nBooking ID: ${bookingId}\nTransaction: ${transactionId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Booking Receipt - Domio",
          text: shareText,
          url: bookingUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${bookingUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Share copy failed:", err);
        setError("Failed to copy share content");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white">
      {showConfetti && (
        <Confetti 
          width={window.innerWidth} 
          height={window.innerHeight} 
          recycle={false} 
          numberOfPieces={300}
          gravity={0.1}
        />
      )}

      {!paymentDone ? (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Complete Your Payment</CardTitle>
              <Badge variant="secondary">Secure</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Booking Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h3 className="font-medium text-sm">Booking Summary</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{itemTitle}</p>
                {type === "place" ? (
                  <p>{checkIn ? format(new Date(checkIn), "dd MMM yyyy") : "-"} — {checkOut ? format(new Date(checkOut), "dd MMM yyyy") : "-"}</p>
                ) : (
                  <p>{selectedDate ? format(new Date(selectedDate), "dd MMM yyyy") : "-"}</p>
                )}
                <p>Guests: {numberOfGuests || 1}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Service fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-500" size={16} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1" 
                onClick={handlePayment} 
                disabled={processing}
              >
                {processing ? "Processing..." : "Pay Now"}
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <CardTitle className="text-lg">Payment Successful!</CardTitle>
                    {bookingId && <p className="text-xs text-muted-foreground">Booking ID: {bookingId}</p>}
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">Confirmed</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Summary */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Booking Details</h3>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">{itemTitle}</p>
                    {type === "place" ? (
                      <p className="text-gray-600">
                        {checkIn ? format(new Date(checkIn), "dd MMM yyyy") : "-"} — {checkOut ? format(new Date(checkOut), "dd MMM yyyy") : "-"}
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        {selectedDate ? format(new Date(selectedDate), "dd MMM yyyy") : "-"}
                      </p>
                    )}
                    <p className="text-gray-600">Guests: {numberOfGuests || 1}</p>
                    <p className="text-gray-600">Payment: {paymentMethod}</p>
                    {transactionId && (
                      <p className="text-xs text-gray-500 font-mono">Transaction: {transactionId}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Service fee</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span>Total Paid</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
                    {/* QR Code & Actions */}
                    <div className="flex flex-col items-center gap-4">
                      <a
                        href={qrValue}        // link to open on click
                        target="_blank"       // open in new tab
                        rel="noopener noreferrer"
                        className="p-3 bg-white rounded-xl shadow-sm border hover:scale-105 transition-transform"
                      >
                        <QRCodeCanvas 
                          id="payment-qr-canvas" 
                          value={qrValue} 
                          size={160} 
                          ref={qrRef}
                          level="M"
                        />
                      </a>
                      <p className="text-xs text-center text-gray-500">
                        Scan or click to verify booking
                      </p>
                    

                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCopy} 
                            className="flex items-center gap-2"
                          >
                            <Copy size={16} /> 
                            {copied ? "Copied!" : "Copy ID"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copied ? "Booking ID copied!" : "Copy booking ID"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSendEmail}
                            disabled={emailSending || !bookingId || !userEmail}
                            className="flex items-center gap-2"
                          >
                            <Mail size={16} /> 
                            {emailSending ? "Sending..." : emailSent ? "Sent!" : "Email"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {emailSent ? "Receipt sent!" : "Send receipt to email"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={downloadPDF} 
                            className="flex items-center gap-2"
                          >
                            <Download size={16} /> PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download receipt as PDF</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleShare} 
                            disabled={!bookingId || !transactionId}
                            className="flex items-center gap-2"
                          >
                            <Share2 size={16} /> Share
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share booking details</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="w-full flex flex-col sm:flex-row gap-2 mt-4">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate("/account/bookings")}
                    >
                      View Bookings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/")}
                    >
                      Go Home
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Need help? support@domio.com</span>
              <span>{dateNow}</span>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}