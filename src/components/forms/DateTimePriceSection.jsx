// src/components/forms/DateTimePriceSection.jsx

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DateTimePriceSection = ({
  checkIn, setCheckIn, checkOut, setCheckOut,
  maxGuests, setMaxGuests, price, setPrice, errors
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      {/* Check In */}
      <div>
        <Label>Check in</Label>
        <Input
          type="text"
          value={checkIn}
          onChange={(ev) => setCheckIn(ev.target.value)}
          placeholder="14"
          required
        />
        {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn[0]}</p>}
      </div>
      
      {/* Check Out */}
      <div>
        <Label>Check out</Label>
        <Input
          type="text"
          value={checkOut}
          onChange={(ev) => setCheckOut(ev.target.value)}
          placeholder="11"
          required
        />
        {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut[0]}</p>}
      </div>
      
      {/* Max Guests */}
      <div>
        <Label>Max guests</Label>
        <Input
          type="number"
          value={maxGuests}
          // FIX: In your original code, the maxGuests input was calling setPrice. Correcting that here.
          onChange={(ev) => setMaxGuests(Number(ev.target.value))} 
          min={1}
          required
        />
        {errors.maxGuests && <p className="text-red-500 text-sm mt-1">{errors.maxGuests[0]}</p>}
      </div>
      
      {/* Price per night */}
      <div>
        <Label>Price per night</Label>
        <Input
          type="number"
          value={price}
          // FIX: In your original code, the price input was calling setMaxGuests. Correcting that here.
          onChange={(ev) => setPrice(Number(ev.target.value))} 
          min={1}
          required
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
      </div>
    </div>
  );
};

export default DateTimePriceSection;