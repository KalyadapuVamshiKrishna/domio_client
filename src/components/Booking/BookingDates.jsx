import { differenceInCalendarDays, format } from "date-fns";

export default function BookingDates({ booking, className = "" }) {
  if (!booking?.checkIn || !booking?.checkOut) return null;

  const nights = differenceInCalendarDays(
    new Date(booking.checkOut),
    new Date(booking.checkIn)
  );

  const formattedCheckIn = format(new Date(booking.checkIn), "MMM d, yyyy");
  const formattedCheckOut = format(new Date(booking.checkOut), "MMM d, yyyy");

  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 text-gray-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 7.5h18M3 7.5v11.25a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V7.5M3 7.5h18"
      />
    </svg>
  );

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <CalendarIcon />
        <span>{nights} night{nights > 1 ? "s" : ""}</span>
      </div>

      <div className="flex items-center gap-1 text-gray-600">
        <span>{formattedCheckIn}</span>
        <span className="text-gray-400 font-bold">&rarr;</span>
        <span>{formattedCheckOut}</span>
      </div>
    </div>
  );
}
