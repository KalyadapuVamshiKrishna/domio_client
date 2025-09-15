"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingWidget from "../components/Booking/BookingWidget";
import PlaceGallery from "../components/Places/PlaceGallery";
import AddressLink from "../components/Account/AddressLink";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslate } from "../hooks/useTranslate";
import { useTranslation } from "react-i18next";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  const { i18n } = useTranslation(); // current selected language
  const { translated, translate } = useTranslate();

  // Fetch place data
  useEffect(() => {
    if (!id) return;
    axios.get(`/places/${id}`).then((response) => setPlace(response.data));
  }, [id]);

  // Translate description dynamically when language changes
  useEffect(() => {
    if (place?.description) {
      translate(place.description, i18n.language);
    }
  }, [i18n.language, place?.description]);

  if (!place)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading place details...
      </div>
    );

  return (
    <div className="min-h-screen bg-white py-18">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Address */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{place.title}</h1>
          <AddressLink className="text-gray-500 mt-1 block">
            {place.address}
          </AddressLink>
        </div>

        {/* Gallery */}
        <div className="rounded-3xl overflow-hidden shadow-md">
          <PlaceGallery place={place} />
        </div>

        {/* Main Info & Booking */}
        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-[2fr_1fr]">
          {/* Description & Details */}
          <div className="flex flex-col gap-6">
            <Card className="shadow-lg rounded-3xl">
              <CardContent>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {/* Use translated text if available, else fallback */}
                  {translated || place.description}
                </p>
                <div className="mt-4 text-gray-600 space-y-2">
                  <div>
                    <span className="font-semibold">Check-in:</span>{" "}
                    {place.checkIn}
                  </div>
                  <div>
                    <span className="font-semibold">Check-out:</span>{" "}
                    {place.checkOut}
                  </div>
                  <div>
                    <span className="font-semibold">Max guests:</span>{" "}
                    {place.maxGuests}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extra Info */}
            {place.extraInfo && (
              <Card className="shadow-lg rounded-3xl">
                <CardContent>
                  <h2 className="text-2xl font-semibold mb-2">Extra Info</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {place.extraInfo}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:w-[380px] flex-shrink-0">
            <Card className="sticky top-24 shadow-lg rounded-3xl">
              <CardContent>
                <BookingWidget item={place} type="place" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
