import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BookingWidget({ item, type }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // For experience/service
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const numberOfNights =
    type === "place" && checkIn && checkOut
      ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
      : 0;

  const totalPrice =
    type === "place"
      ? numberOfNights * item.price
      : item.price * numberOfGuests;

  async function handleBooking() {
    // Basic validations
    if (type === "place" && (!checkIn || !checkOut)) {
      return alert("Please select check-in and check-out dates.");
    }
    if (type !== "place" && !selectedDate) {
      return alert("Please select a date.");
    }
    if (!phone.trim() || !name.trim()) {
      return alert("Please fill in all details.");
    }

    try {
      const bookingData = {
        type, // "place" | "experience" | "service"
        itemId: item._id, // dynamic id
        name,
        phone,
        numberOfGuests,
        price: totalPrice,
        ...(type === "place"
          ? { checkIn, checkOut }
          : { date: selectedDate }),
      };

      const response = await axios.post("/bookings", bookingData);
      const booking = response.data;

      navigate("/payment", {
  state: {
    amount: totalPrice,
    bookingId: booking._id, // optional for receipt
    userName: user.name,
    userEmail: user.email,
  },
});
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-lg mx-auto w-full border border-gray-200">
      {/* Price */}
      <div className="text-center mb-6">
        <span className="text-2xl font-semibold">₹{item.price}</span>{" "}
        <span className="text-gray-500 text-sm">
          {type === "place" ? "/ night" : "per person"}
        </span>
      </div>

      {/* Date Selection */}
      {type === "place" ? (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-sm">Check-in</label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium text-sm">Check-out</label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Guests */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-sm">Guests</label>
        <Input
          type="number"
          min={1}
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Name & Phone */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block mb-1 font-medium text-sm">Full Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm">Phone</label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      {/* Book Button */}
      <Button
        onClick={handleBooking}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2"
      >
        Book
        {totalPrice > 0 && <span className="font-bold">₹{totalPrice}</span>}
      </Button>
    </div>
  );
}
