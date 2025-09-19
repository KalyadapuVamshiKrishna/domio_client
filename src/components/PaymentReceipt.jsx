import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// shadcn/ui components (project -level paths assumed)
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Mail, CheckCircle, Home, Share2 } from "lucide-react";
import { format } from "date-fns";

export default function PaymentReceiptImproved() {
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const qrId = "payment-qr-canvas";
  const qrRef = useRef(null);
  const navigate = useNavigate();

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
  } = useLocation().state || {};

  useEffect(() => {
    // Safety: if component mounted without payment details, redirect
    if (!totalPrice) {
      // keep it gentle — only redirect if there's nothing to show
      // navigate("/", { replace: true });
    }
  }, [totalPrice]);

  const dateNow = format(new Date(), "PPP p");

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // pretend processing delay
      await new Promise((r) => setTimeout(r, 1200));

      const id = "TXN-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
      setTransactionId(id);
      setPaymentDone(true);
      setShowConfetti(true);

      // Create booking in backend and capture bookingId if returned
      try {
        const bookingData = {
          type,
          itemId,
          title: itemTitle,
          name,
          phone,
          numberOfGuests,
          price: totalPrice,
          transactionId: id,
          ...(type === "place" ? { checkIn, checkOut } : { date: selectedDate }),
        };

        const resp = await axios.post("/bookings", bookingData);
        if (resp?.data?.bookingId) setBookingId(resp.data.bookingId);
      } catch (err) {
        // non-fatal: booking creation failed, keep UX graceful
        console.error("Booking creation failed:", err?.response || err.message || err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
      // hide confetti after a while
      setTimeout(() => setShowConfetti(false), 4500);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(20);
    doc.text("Payment Receipt", 40, 60);

    // small summary table
    doc.setFontSize(12);
    const startY = 100;
    doc.text(`Transaction ID: ${transactionId}`, 40, startY);
    doc.text(`Name: ${name}`, 40, startY + 18);
    doc.text(`Email: ${userEmail || "-"}`, 40, startY + 36);
    doc.text(`Amount: ₹${totalPrice}`, 40, startY + 54);
    doc.text(`Date: ${dateNow}`, 40, startY + 72);

    // add item & booking details
    doc.text(`Item: ${itemTitle || "-"}`, 40, startY + 110);
    if (type === "place") {
      doc.text(`Check-in: ${checkIn ? format(new Date(checkIn), "dd MMM yyyy") : "-"}`, 40, startY + 128);
      doc.text(`Check-out: ${checkOut ? format(new Date(checkOut), "dd MMM yyyy") : "-"}`, 40, startY + 146);
    } else {
      doc.text(`Date: ${selectedDate ? format(new Date(selectedDate), "dd MMM yyyy") : "-"}`, 40, startY + 128);
    }

    // capture QR and add
    const canvas = document.getElementById(qrId);
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      // place QR at right side
      doc.addImage(imgData, "PNG", doc.internal.pageSize.width - 150, 40, 100, 100);
    }

    doc.save(`Receipt_${transactionId || "unknown"}.pdf`);
  };

  const handleCopy = async () => {
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleSendEmail = async () => {
    if (!userEmail) return setEmailSent(false);
    try {
      // optimistic UI
      setEmailSent(true);
      await axios.post("/send-receipt", { email: userEmail, transactionId, totalPrice });
    } catch (err) {
      console.error("Email send failed", err);
      setEmailSent(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Payment Receipt", text: `Receipt ${transactionId} - ₹${totalPrice}` });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      // fallback: copy
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {!paymentDone ? (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Complete Your Payment</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Secure checkout powered by your app</p>
              </div>
              <Badge variant="secondary">Secure</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold">₹{totalPrice}</p>
                <p className="text-xs text-muted-foreground mt-1">{type === "place" ? "/ night" : "per person"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pay securely using test gateway (demo)</p>
                <div className="flex gap-2">
                  <Button onClick={handlePayment} className="flex-1" disabled={processing}>
                    {processing ? "Processing..." : "Pay Now"}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <small className="text-xs text-muted-foreground">By continuing you agree to our Terms & Refund Policy</small>
          </CardFooter>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" />
                  <div>
                    <CardTitle className="text-lg">Payment Successful</CardTitle>
                    <p className="text-sm text-muted-foreground">Reference #{transactionId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">Paid</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* left: booking & amounts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Booking summary</h3>
                  <div className="text-sm text-muted-foreground">
                    <p className="truncate"><strong>{itemTitle}</strong></p>
                    {type === "place" ? (
                      <p>{checkIn ? format(new Date(checkIn), "dd MMM yyyy") : "-"} — {checkOut ? format(new Date(checkOut), "dd MMM yyyy") : "-"}</p>
                    ) : (
                      <p>{selectedDate ? format(new Date(selectedDate), "dd MMM yyyy") : "-"}</p>
                    )}
                    <p>Guests: {numberOfGuests || 1}</p>
                  </div>

                  <Separator />

                  <div className="text-sm">
                    <div className="flex items-center justify-between"><span>Subtotal</span><strong>₹{totalPrice}</strong></div>
                    {/* Add service/fees breakdown if you want */}
                    <div className="flex items-center justify-between text-muted-foreground text-xs"><span>Service fee</span><span>₹{Math.max(50, Math.round(totalPrice * 0.05))}</span></div>
                    <div className="flex items-center justify-between mt-2"><span className="text-sm">Total</span><strong>₹{totalPrice}</strong></div>
                  </div>
                </div>

                {/* right: QR and actions */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <div className="relative">
                      <QRCodeCanvas id={qrId} value={transactionId} size={160} ref={qrRef} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center w-full">
                    <Tooltip content={copied ? "Copied" : "Copy transaction id"}>
                      <Button variant="ghost" onClick={handleCopy} className="flex items-center gap-2">
                        <Copy size={16} /> {copied ? "Copied" : "Copy"}
                      </Button>
                    </Tooltip>

                    <Tooltip content={emailSent ? "Receipt sent" : "Send receipt to email"}>
                      <Button variant="outline" onClick={handleSendEmail} className="flex items-center gap-2">
                        <Mail size={16} /> {emailSent ? "Sent" : "Email"}
                      </Button>
                    </Tooltip>

                    <Button variant="ghost" onClick={downloadPDF} className="flex items-center gap-2">
                      <Download size={16} /> PDF
                    </Button>

                    <Button variant="ghost" onClick={handleShare} className="flex items-center gap-2">
                      <Share2 size={16} /> Share
                    </Button>
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-2 mt-2">
                    <Button className="flex-1" onClick={() => bookingId ? navigate(`account/bookings/${bookingId}`) : navigate("/account/bookings")}>View booking</Button>
                    <Button variant="ghost" onClick={() => navigate("/")}>Go home</Button>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
              <small className="text-xs text-muted-foreground">Need help? Contact support at support@example.com</small>
              <small className="text-xs text-muted-foreground">{dateNow}</small>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
