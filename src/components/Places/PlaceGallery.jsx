import { useState } from "react";
import Image from "../../Image.jsx";
import { Button } from "@/components/ui/button";

export default function PlaceGallery({ place }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Photos of {place.title}</h2>
            <Button
              variant="outline"
              className="text-black bg-white"
              onClick={() => setShowAllPhotos(false)}
            >
              Close
            </Button>
          </div>
          <div className="grid gap-4">
            {place.photos?.map((photo, idx) => (
              <Image
                key={idx}
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      <div className="grid grid-cols-[2fr_1fr] gap-2 rounded-3xl overflow-hidden">
        {/* Main Photo */}
        {place.photos?.[0] && (
          <div>
            <Image
              src={place.photos[0]}
              alt="Main photo"
              className="aspect-square w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setShowAllPhotos(true)}
            />
          </div>
        )}

        {/* Side Photos */}
        <div className="grid gap-2">
          {place.photos?.[1] && (
            <Image
              src={place.photos[1]}
              alt="Side photo 1"
              className="aspect-square w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setShowAllPhotos(true)}
            />
          )}
          {place.photos?.[2] && (
            <Image
              src={place.photos[2]}
              alt="Side photo 2"
              className="aspect-square w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setShowAllPhotos(true)}
            />
          )}
        </div>
      </div>

      {/* Show More Button */}
      {place.photos?.length > 3 && (
        <Button
          size="sm"
          className="absolute bottom-2 right-2 bg-white text-black shadow-md"
          onClick={() => setShowAllPhotos(true)}
        >
          Show more photos
        </Button>
      )}
    </div>
  );
}
