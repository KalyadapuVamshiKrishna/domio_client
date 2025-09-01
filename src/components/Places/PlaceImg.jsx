import Image from "../../Image.jsx";

export default function PlaceImg({ place, index = 0, className = "object-cover rounded-2xl" }) {
  if (!place?.photos?.length) return null;

  return (
    <Image
      className={className}
      src={place.photos[index]}
      alt={place.title || "Place image"}
    />
  );
}
