import Image from "../../Image.jsx";

export default function PlaceImg({ place, className }) {
  // Null-safe fallback
  if (!place || !place.photos || place.photos.length === 0) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
      >
        No Image
      </div>
    );
  }

  // Normal render
  return (
    <img
      src={place.photos[0]}
      alt={place.title || "Place"}
      className={className}
    />
  );
}

