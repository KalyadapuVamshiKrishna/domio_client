"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

export default function ServicePage() {
  const { id } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/services/${id}`).then((response) => setService(response.data));
  }, [id]);

  if (!service)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading service details...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800">{service.title}</h1>
          <p className="text-gray-600 mt-2 text-lg">{service.category}</p>
        </div>

        {/* Image */}
        <div className="rounded-3xl overflow-hidden shadow-md mb-10">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Main Info */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          
          {/* Left Section */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Description */}
            <Card className="shadow-md rounded-3xl">
              <CardContent>
                <h2 className="text-2xl font-semibold mb-4">About This Service</h2>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>

            {/* Key Features */}
            {service.features && service.features.length > 0 && (
              <Card className="shadow-md rounded-3xl">
                <CardContent>
                  <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    {service.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {service.reviews && service.reviews.length > 0 && (
              <Card className="shadow-md rounded-3xl">
                <CardContent>
                  <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
                  <div className="space-y-4">
                    {service.reviews.map((review, index) => (
                      <div key={index} className="border-b pb-4">
                        <p className="font-semibold text-gray-800">{review.user}</p>
                        <p className="text-gray-600">{review.comment}</p>
                        <p className="text-sm text-yellow-500">⭐ {review.rating}/5</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-6">
            
            {/* Price */}
            <Card className="shadow-md rounded-3xl">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">Price</h3>
                <p className="text-2xl font-bold text-green-600">₹{service.price}</p>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="shadow-md rounded-3xl">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">Availability</h3>
                <p className="text-gray-700">{service.availability || "Check with provider"}</p>
              </CardContent>
            </Card>

            {/* Service Provider Info */}
            {service.provider && (
              <Card className="shadow-md rounded-3xl">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Service Provider</h3>
                  <p className="text-gray-800">{service.provider.name}</p>
                  <p className="text-gray-600 text-sm">{service.provider.contact}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
