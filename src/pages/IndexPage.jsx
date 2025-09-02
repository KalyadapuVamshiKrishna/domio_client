import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import Image from "../Image.jsx";
import { Heart, Star } from "lucide-react"; // ✅ Added Star icon
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const limit = 12;

  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "";
  const sortBy = searchParams.get("sortBy") || "";

  const fetchPlaces = async (isLoadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/places`, {
        params: { location, checkIn, checkOut, guests, sortBy, page, limit },
      });

      const fetchedPlaces = Array.isArray(res.data.places)
        ? res.data.places
        : [];

      if (isLoadMore) {
        setPlaces((prev) => [...prev, ...fetchedPlaces]);
      } else {
        setPlaces(fetchedPlaces);
      }

      setHasMore(fetchedPlaces.length >= limit);
    } catch (err) {
      console.error("Failed to fetch places:", err);
      setError("Unable to load listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPlaces(false);
  }, [location, checkIn, checkOut, guests, sortBy]);

  useEffect(() => {
    if (page > 1) {
      fetchPlaces(true);
    }
  }, [page]);

  const lastPlaceRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  /** Loading State */
  if (loading && places.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-16 px-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  /** Error State */
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-red-600 text-lg font-medium">
        {error}
      </div>
    );
  }

  /** Empty State */
  if (!places.length) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gray-500 text-lg">
        No listings found for "{location || 'all locations'}".
      </div>
    );
  }

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Explore Stays
      </h1>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {places.map((place, index) => {
          const isLastItem = index === places.length - 1;
          return (
            <Link
              key={place._id}
              to={`/place/${place._id}`}
              className="group block"
              ref={isLastItem ? lastPlaceRef : null}
            >
              <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition duration-300 relative">
                {/* Wishlist Icon */}
                <button className="absolute top-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-md hover:scale-110">
                  <Heart size={18} className="text-gray-700 hover:text-red-500" />
                </button>

                {/* Image */}
                <div className="relative w-full h-56 bg-gray-100">
                  {place.photos?.[0] ? (
                    <Image
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      src={place.photos[0]}
                      alt={place.title || "Place"}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No Image Available
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-base font-semibold truncate">
                      {place.title || "Untitled"}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 truncate">
                      {place.address || "Unknown address"}
                    </CardDescription>
                  </CardHeader>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-lg font-bold text-gray-900">
                      ${place.price ?? "N/A"}
                      <span className="text-gray-500 text-sm font-normal">
                        {" "}
                        / night
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" /> {/* ✅ Icon */}
                      {place.rating ? place.rating.toFixed(1) : "4.8"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Loading More Indicator */}
      {loading && places.length > 0 && (
        <div className="text-center mt-6 text-gray-500 text-sm">
          Loading more listings...
        </div>
      )}
    </div>
  );
}
