import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { UserContext } from "../../Context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingWidget({ item, type }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkInPopoverOpen, setCheckInPopoverOpen] = useState(false);
  const [checkOut, setCheckOut] = useState(null);
  const [checkOutPopoverOpen, setCheckOutPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const numberOfNights =
    type === "place" && checkIn && checkOut
      ? differenceInCalendarDays(checkOut, checkIn)
      : 0;

  const totalPrice =
    type === "place"
      ? numberOfNights * item.price
      : item.price * numberOfGuests;

  const serviceFee = Math.max(50, Math.round(totalPrice * 0.05));
  const grandTotal = totalPrice + serviceFee;

  function handleProceedToPayment() {
  // Check if user is not signed in
  if (!user) {
    alert("Please sign in to continue.");
    navigate("/login");
    return;
  }

  if (type === "place" && (!checkIn || !checkOut)) {
    return alert("Please select check-in and check-out dates.");
  }
  if (type !== "place" && !selectedDate) {
    return alert("Please select a date.");
  }
  if (!phone.trim() || !name.trim()) {
    return alert("Please fill in all details.");
  }

  const state = {
    type,
    itemId: item._id,
    itemTitle: item.title || item.name,
    checkIn: checkIn ? checkIn.toISOString() : null,
    checkOut: checkOut ? checkOut.toISOString() : null,
    selectedDate: selectedDate ? selectedDate.toISOString() : null,
    numberOfGuests,
    name,
    phone,
    totalPrice: grandTotal,
    userName: user?.name || name,
    userEmail: user?.email || "",
    paymentMethod: "Test Gateway",
  };

  navigate("/payment", { state });
}


  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto border border-gray-200">
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
          {/* Check-in */}
          <div className="flex-1">
            <label className="block mb-1 font-medium text-sm">Check-in</label>
            <Popover
              open={checkInPopoverOpen}
              onOpenChange={setCheckInPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal truncate",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {checkIn ? format(checkIn, "dd/MM/yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date);
                    if (checkOut && date && checkOut <= date) setCheckOut(null);
                    if (date) setCheckInPopoverOpen(false);
                  }}
                  disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="flex-1">
            <label className="block mb-1 font-medium text-sm">Check-out</label>
            <Popover
              open={checkOutPopoverOpen}
              onOpenChange={setCheckOutPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal truncate",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {checkOut ? format(checkOut, "dd/MM/yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => {
                    setCheckOut(date);
                    if (date) setCheckOutPopoverOpen(false);
                  }}
                  disabled={(date) =>
                    date < new Date().setHours(0, 0, 0, 0) ||
                    (checkIn && date <= checkIn)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal truncate",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Guests */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-sm">Guests</label>
        <Input
          type="number"
          min={1}
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(Number(e.target.value))}
        />
      </div>

      {/* Name & Phone */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block mb-1 font-medium text-sm">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm">Phone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
      </div>

      {/* Proceed Button */}
      <Button
        onClick={handleProceedToPayment}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white"
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed to Pay"}{" "}
        {grandTotal > 0 && <span className="font-bold">₹{grandTotal}</span>}
      </Button>

      {message && <p className="text-center mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
