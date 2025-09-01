import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";



const PaymentReceipt = () => {
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hoverQR, setHoverQR] = useState(false);
  const location = useLocation();
  const { amount, bookingId, userName, userEmail } = location.state || {};

  
  const user = { name: userName, email: userEmail };
  const amountInWords = amount;
  const date = new Date().toLocaleString();

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const id = "TXN-" + Math.floor(Math.random() * 1000000);
      setTransactionId(id);
      setPaymentDone(true);
      setShowConfetti(true);
      setProcessing(false);
      setTimeout(() => setShowConfetti(false), 5000);
    }, 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payment Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transactionId}`, 20, 40);
    doc.text(`Name: ${user.name}`, 20, 50);
    doc.text(`Email: ${user.email}`, 20, 60);
    doc.text(`Amount: ₹${amountInWords}`, 20, 70);
    doc.text(`Date: ${date}`, 20, 80);
    doc.save(`Receipt_${transactionId}.pdf`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative font-sans pt-16"
         style={{ background: "linear-gradient(135deg, #f0f4ff, #e6f7ff)" }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {!paymentDone ? (
        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Payment</h2>
          <p className="text-gray-600 text-lg">Amount: ₹{amountInWords}</p>

          {processing ? (
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div className="bg-blue-500 h-4 animate-pulse w-full"></div>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300 font-semibold"
            >
              Pay Now
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center gap-4 border-t-4 border-green-500"
        >
          {/* Animated Success Text */}
          <motion.h2
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-2xl font-bold text-green-600 mb-4"
          >
            Payment Successful!
          </motion.h2>

          <div className="flex flex-col gap-2 w-full text-gray-700">
            <p><strong>Transaction ID:</strong> {transactionId}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Amount:</strong> ₹{amount}</p>
            <p><strong>Date:</strong> {date}</p>
          </div>

          {/* QR Code with hover effect */}
          <div 
            className="mt-4 flex flex-col items-center relative shadow-lg p-2 rounded-xl bg-white"
            onMouseEnter={() => setHoverQR(true)}
            onMouseLeave={() => setHoverQR(false)}
          >
           <QRCodeCanvas value={transactionId} size={hoverQR ? 150 : 128} className="transition-transform duration-300" />

            <AnimatePresence>
              {hoverQR && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute -bottom-7 text-sm bg-gray-800 text-white px-2 py-1 rounded-md"
                >
                  Scan to verify transaction
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col w-full gap-2 mt-4">
            <button
              onClick={downloadPDF}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300 font-semibold"
            >
              Download Receipt
            </button>
            <button
              onClick={() => setPaymentDone(false)}
              className="px-6 py-2 bg-gray-300 rounded-xl shadow hover:bg-gray-400 transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Make Another Payment
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentReceipt;
