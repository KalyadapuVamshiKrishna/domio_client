import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "../Image.jsx";

export default function FavoritesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get("/wishlist",  { withCredentials: true });
        setPlaces(res.data || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const toggleFavorite = async (placeId) => {
    try {
      const res = await axios.post(`/places/${placeId}/toggle-wishlist`,  { withCredentials: true });
      // 🔄 API returns updated wishlist → filter local state
      const updatedWishlist = res.data.wishlist || [];
      setPlaces((prev) =>
        prev.filter((p) => updatedWishlist.includes(p._id.toString()))
      );
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!places.length) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold mb-3">No favorites yet</h2>
        <p className="text-gray-600">Tap the heart on a stay to add it here.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Your favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {places.map((place) => (
          <motion.div
            key={place._id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="group relative bg-white/50 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition"
          >
            <Link to={`/place/${place._id}`} className="block">
              <div className="relative">
                {place.photos?.[0] ? (
                  <Image
                    src={place.photos[0]}
                    alt={place.title || "Place"}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-56 flex items-center justify-center bg-gray-200">
                    No image
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(place._id);
                  }}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:scale-110 transition"
                >
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{place.title}</h3>
                <p className="text-sm text-gray-500 truncate">{place.address}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">
                    ₹{place.price?.toLocaleString("en-IN")}
                  </span>
                  <div className="flex items-center text-sm">
                    <Star className="text-yellow-500 w-4 h-4 mr-1" />
                    {place.rating ? place.rating.toFixed(1) : "4.8"}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
