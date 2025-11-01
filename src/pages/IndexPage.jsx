import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Image from "../Image.jsx";
import { Heart, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { UserContext } from "../Context/UserContext.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";


axios.defaults.withCredentials = true;

// 🔄 Spinner
function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <svg
        className="animate-spin h-6 w-6 text-rose-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}

// 🔄 Skeleton shimmer
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="bg-gray-200 h-56 w-full" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function IndexPage() {
  const { user } = useContext(UserContext);

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const [priceRange, setPriceRange] = useState([1000, 8000]);
  const listEndRef = useRef(null);
  const fetchingRef = useRef(false);
  const limit = 12;

  const [searchParams] = useSearchParams();
  const queryLocation = searchParams.get("location") || "";
  const queryCheckIn = searchParams.get("checkIn") || "";
  const queryCheckOut = searchParams.get("checkOut") || "";
  const queryGuests = searchParams.get("guests") || "";

 
  const fetchPlaces = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;  // gaurd clause

      if (pageToFetch === 1) {
        setLoading(true);
        setError(null);
      } else {
        setPageLoading(true);
      }

      try {
        const res = await axios.get("/places", {
          params: {
            location: queryLocation,
            checkIn: queryCheckIn,
            checkOut: queryCheckOut,
            guests: queryGuests,
            sortBy,
            page: pageToFetch,
            limit,
            priceMin: priceRange[0],
            priceMax: priceRange[1],
          },
          withCredentials: true,
        });
       

        const fetchedPlaces = Array.isArray(res.data.places) ? res.data.places : []; // Ensure it's an array

        const enrichedPlaces = fetchedPlaces.map((p) => ({
          ...p,
          isFavorite: user?.wishlist?.includes(p._id.toString()) ?? false, // check if in user's wishlist
        }));
        setPlaces((prev) => (append ? [...prev, ...enrichedPlaces] : enrichedPlaces));
        setHasMore(fetchedPlaces.length >= limit);
      } catch (err) {
        console.error("Failed to fetch places:", err);
        setError("Unable to load listings. Please try again later.");
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setPageLoading(false);
      }
    },
    [queryLocation, queryCheckIn, queryCheckOut, queryGuests, sortBy, priceRange]
  );

  const markWishlist = (wishlist) => {
    const wishlistSet = new Set(wishlist.map((id) => id.toString()));
    setPlaces((prev) =>
      prev.map((p) => ({ ...p, isFavorite: wishlistSet.has(p._id.toString()) }))
    );
  };

  useEffect(() => {
    if (!user) return; 
  
    if (user.wishlist?.length) {
      markWishlist(user.wishlist); 
    }
  }, [user]);
  


  useEffect(() => {
    setPage(1);
    fetchPlaces(1, false);
  }, [fetchPlaces]);


  useEffect(() => {
    if (page === 1) return;
    fetchPlaces(page, true);
  }, [page, fetchPlaces]);

  
  useEffect(() => {
    if (pageLoading || loading) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    if (listEndRef.current) observer.observe(listEndRef.current);

    return () => {
      if (listEndRef.current) observer.unobserve(listEndRef.current);
    };
  }, [pageLoading, loading, hasMore]);


  const toggleFavorite = async (placeId) => {
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    try {
      const res = await axios.post(`/places/${placeId}/toggle-wishlist`, {}, { withCredentials: true });
      const { isFavorite } = res.data;
      

      setPlaces((prev) =>
        prev.map((p) => (p._id === placeId ? { ...p, isFavorite } : p))
      );
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  const formatPrice = (p) => (p == null ? "N/A" : `₹${p.toLocaleString("en-IN")}`);

  
  if (loading && places.length === 0) {
    return (
      <div className="mt-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 text-center text-gray-700">
        <h2 className="text-2xl font-semibold text-rose-500 mb-3">
          Oops, something went wrong!
        </h2>
        <p className="mb-6">{error}</p>
        <Button onClick={() => fetchPlaces(1, false)}>Retry</Button>
      </div>
    );
  }

  if (!places.length) {
    return (
      <div className="mt-20 text-center text-gray-700">
        <h3 className="text-xl font-semibold mb-2">No stays found</h3>
        <p className="text-gray-500 mb-6">
          Try changing filters or clearing your search.
        </p>
        <Button onClick={() => fetchPlaces(1, false)}>Clear filters</Button>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Explore stays</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Grid */}
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
                <Image
                  src={place.photos?.[0]}
                  alt={place.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(place._id);
                  }}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:scale-110 transition"
                >
                  <Heart
                    size={18}
                    className={`transition-colors ${
                      place.isFavorite
                        ? "text-rose-500 fill-rose-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{place.title}</h3>
                <p className="text-sm text-gray-500 truncate">{place.address}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">{formatPrice(place.price)}<span className="font-light text-sm"> /night</span></span>
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

      {/* Infinite scroll */}
      <div ref={listEndRef}>
        {(pageLoading || loading) && <Spinner />}
        {!hasMore && (
          <div className="text-center text-gray-500 py-6">
            You&apos;ve reached the end.
          </div>
        )}
      </div>

     <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Filters</DialogTitle>
      <DialogDescription>
        Set your filters for price, sort order, and other options.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Price Range */}
      <div>
        <label className="text-sm block mb-1">Price range</label>
        <Slider
          value={priceRange}
          min={500}
          max={20000}
          step={500}
          onValueChange={setPriceRange}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Sort By using shadcn Select */}
      <div>
  <label className="text-sm block mb-1">Sort by</label>
  <Select value={sortBy} onValueChange={setSortBy}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Newest" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="newest">Newest</SelectItem>
    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
  </SelectContent>
</Select>


</div>


      {/* Apply Filters Button */}
      <Button
        className="w-full mt-2"
        onClick={() => {
          setFiltersOpen(false);
          setPage(1);
          fetchPlaces(1, false);
        }}
      >
        Apply Filters
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}
