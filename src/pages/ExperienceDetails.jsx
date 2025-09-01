"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import BookingWidget from "../components/Booking/BookingWidget"; // ✅ Import BookingWidget

export default function ExperiencePage() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchExperience = async () => {
      try {
        const response = await axios.get(`/experiences/${id}`);
        setExperience(response.data);
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading experience details...
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load experience details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-18">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Location */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{experience.title || "Untitled Experience"}</h1>
          <p className="text-gray-500 mt-1">{experience.location || "Unknown Location"}</p>
        </div>

        {/* Image Gallery */}
        {experience.photos && experience.photos.length > 0 ? (
          <div className="rounded-3xl overflow-hidden shadow-md mb-6">
            <img
              src={experience.photos[0]}
              alt={experience.title || "Experience"}
              className="w-full h-[400px] object-cover"
            />
          </div>
        ) : (
          <div className="h-[400px] bg-gray-200 flex items-center justify-center rounded-3xl mb-6">
            No image available
          </div>
        )}

        {/* Info & Payment */}
        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-[2fr_1fr]">
          {/* Description */}
          <div className="flex flex-col gap-6">
            <Card className="shadow-lg rounded-3xl">
              <CardContent>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {experience.description || "No description available."}
                </p>
                <div className="mt-4 text-gray-600 space-y-2">
                  <div>
                    <span className="font-semibold">Duration:</span>{" "}
                    {experience.duration || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Price:</span> ₹
                    {experience.price || "0"}
                  </div>
                  <div>
                    <span className="font-semibold">Available Spots:</span>{" "}
                    {experience.availableSpots || "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Widget */}
          <div className="lg:w-[380px] flex-shrink-0">
            <Card className="sticky top-24 shadow-lg rounded-3xl">
              <CardContent>
                <BookingWidget item={experience} type="experience" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
