import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Image from "../Image.jsx";
import { Heart, Star, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Redesigned IndexPage (Explore Stays)
 *
 * Mobile-first, responsive, polished UX.
 *
 * Notes:
 * - Adjust API endpoints and data shape if needed.
 * - Ensure Tailwind is configured; tweak colors to match your design system.
 */

function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <svg
        className="animate-spin h-6 w-6 text-rose-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="bg-gray-200 rounded-2xl overflow-hidden h-56 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false); // for infinite scroll loads
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [searchParams] = useSearchParams();
  const queryLocation = searchParams.get("location") || "";
  const queryCheckIn = searchParams.get("checkIn") || "";
  const queryCheckOut = searchParams.get("checkOut") || "";
  const queryGuests = searchParams.get("guests") || "";
  const querySort = searchParams.get("sortBy") || "";

  // local UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // optimistic wishlist
  const observerRef = useRef(null);
  const listEndRef = useRef(null);
  const limit = 12;

  // local filter UI (demo: priceMin / priceMax)
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Fetch function (page-aware)
  const fetchPlaces = useCallback(
    async (pageToFetch = 1, append = false) => {
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
            sortBy: querySort,
            page: pageToFetch,
            limit,
            priceMin: priceMin || undefined,
            priceMax: priceMax || undefined,
          },
        });

        const fetchedPlaces = Array.isArray(res.data.places) ? res.data.places : [];

        setPlaces((prev) => (append ? [...prev, ...fetchedPlaces] : fetchedPlaces));

        setHasMore(fetchedPlaces.length >= limit);

        // populate favorites set if API returns wishlist info
        if (pageToFetch === 1 && res.data.wishlistIds) {
          try {
            setFavoriteIds(new Set(res.data.wishlistIds));
          } catch {}
        }
      } catch (err) {
        console.error("Failed to fetch places:", err);
        setError("Unable to load listings. Please try again later.");
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [queryLocation, queryCheckIn, queryCheckOut, queryGuests, querySort, priceMin, priceMax]
  );

  // initial + filter changes reset page
  useEffect(() => {
    setPage(1);
    fetchPlaces(1, false);
  }, [fetchPlaces]);

  // load more when page increments
  useEffect(() => {
    if (page === 1) return;
    fetchPlaces(page, true);
  }, [page, fetchPlaces]);

  // Intersection observer for infinite scroll
  const lastPlaceRef = useCallback(
    (node) => {
      if (pageLoading || loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      }, { rootMargin: "200px" });

      if (node) observerRef.current.observe(node);
    },
    [pageLoading, loading, hasMore]
  );

  // wishlist toggle (optimistic)
  const toggleFavorite = async (placeId) => {
    // optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });

    try {
      await axios.post(`/places/${placeId}/toggle-wishlist`);
      // server response not used; we keep optimistic
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      // rollback on failure (simple rollback strategy)
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(placeId)) next.delete(placeId);
        else next.add(placeId);
        return next;
      });
    }
  };

  // helper: format price
  const formatPrice = (p) => {
    if (p == null) return "N/A";
    // assume p is number (₹)
    return `₹${p.toLocaleString("en-IN")}`;
  };

  // UI-level: apply filters
  const applyFilters = () => {
    setFiltersOpen(false);
    setPage(1);
    fetchPlaces(1, false);
  };

  // render states
  if (loading && places.length === 0) {
    // mobile-first skeleton grid
    return (
      <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Explore stays</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-2">
              <SkeletonCard  className="rounded-2xl"/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-rose-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchPlaces(1, false)}
            className="px-4 py-2 bg-rose-500 text-white rounded-full"
          >
            Retry
          </button>
          <Link to="/" className="px-4 py-2 rounded-full border">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!places.length) {
    return (
      <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="w-full max-w-sm mx-auto">
          <svg viewBox="0 0 64 64" className="mx-auto mb-6 h-28 w-28 text-gray-200" fill="none" aria-hidden>
            <rect x="2" y="10" width="60" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
            <path d="M8 22h48" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="30" r="2" fill="currentColor" />
            <circle cx="28" cy="30" r="2" fill="currentColor" />
            <circle cx="36" cy="30" r="2" fill="currentColor" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No stays found</h3>
          <p className="text-gray-600 mb-6">Try changing filters or clearing your search.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setPriceMin(""); setPriceMax(""); setPage(1); fetchPlaces(1, false); }} className="px-4 py-2 rounded-full border">
              Clear filters
            </button>
            <button onClick={() => setFiltersOpen(true)} className="px-4 py-2 rounded-full bg-rose-500 text-white">
              Show filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      {/* Header + filter button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Explore stays</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Filters</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {places.map((place, index) => {
          const isLastItem = index === places.length - 1;
          const favorited = favoriteIds.has(place._id);
          return (
            <Link
              key={place._id}
              to={`/place/${place._id}`}
              className="group block"
              ref={isLastItem ? lastPlaceRef : null}
            >
              <motion.article
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="bg-white/40 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden"

                aria-labelledby={`place-title-${place._id}`}
              >
                <div className="relative w-full h-56 bg-transperant">
                  {/* Image (lazy + cover) */}
                  {place.photos?.[0] ? (
                    <Image
                      src={place.photos[0]}
                      alt={place.title || "Place image"}
                      className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-transperant">
                      No image
                    </div>
                  )}

                  {/* Top-right wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // stop link navigation
                      e.stopPropagation();
                      toggleFavorite(place._id);
                    }}
                    aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-105 transform transition"
                  >
                    <Heart
                      size={18}
                      className={`transition-colors ${favorited ? "text-rose-500" : "text-gray-600"}`}
                    />
                  </button>

                  {/* bottom gradient + title overlay */}
                  <div className="absolute left-0 right-0 bottom-0">
                    <div className="bg-gradient-to-t from-transperant via-black/20 to-transparent px-4 py-3">
                      <h3 id={`place-title-${place._id}`} className="text-white text-sm font-semibold truncate">
                        {place.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-gray-200 truncate mt-1">{place.address || "Unknown address"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(place.price)}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-transperant px-2 py-1 rounded-full">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-sm text-gray-700">{place.rating ? place.rating.toFixed(1) : "4.8"}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </Link>
          );
        })}
      </div>

      {/* bottom loader */}
      <div ref={listEndRef}>
        {(pageLoading || loading) && <Spinner />}
        {!hasMore && (
          <div className="text-center text-gray-500 py-6">You've reached the end of the list.</div>
        )}
      </div>

      {/* Filters drawer (simple) */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 bg-black/40"
            />

            {/* Drawer panel (bottom sheet on mobile, side panel on md+) */}
            <div className="absolute left-0 right-0 bottom-0 md:top-0 md:right-0 md:left-auto md:w-[380px] bg-white rounded-t-2xl md:rounded-l-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Filters</h4>
                <button onClick={() => setFiltersOpen(false)} className="px-2 py-1 rounded-full border">Close</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Price range (min)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-1">Price range (max)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Placeholder for more filters: amenities, rooms, instant book */}
                <div>
                  <label className="text-sm text-gray-700 block mb-2">More filters</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="border rounded px-2 py-1 text-sm">Wi-Fi</button>
                    <button className="border rounded px-2 py-1 text-sm">Kitchen</button>
                    <button className="border rounded px-2 py-1 text-sm">Air con</button>
                    <button className="border rounded px-2 py-1 text-sm">Washer</button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={applyFilters} className="flex-1 bg-rose-500 text-white py-2 rounded-full">
                    Apply filters
                  </button>
                  <button onClick={() => { setPriceMin(""); setPriceMax(""); }} className="px-4 py-2 rounded-full border">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
