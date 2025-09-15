import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Spinner({ text = "Loading..." }) {
  return (
    <div className="py-6 flex items-center justify-center">
      <svg
        className="animate-spin h-6 w-6 mr-3 text-rose-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span className="text-gray-600">{text}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-0 overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-200" />
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // initial load
  const [pageLoading, setPageLoading] = useState(false); // loading for subsequent pages
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 12;
  const fetchingRef = useRef(false); // guard to prevent duplicate requests
  const observerRef = useRef(null);

  const fetchServices = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      if (pageToFetch === 1) {
        setLoading(true);
        setError(null);
      } else {
        setPageLoading(true);
      }

      try {
        const res = await axios.get("/services", {
          params: { page: pageToFetch, limit },
        });

        // adapt depending on API shape: expecting array at res.data
        const fetched = Array.isArray(res.data) ? res.data : [];

        setServices((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(fetched.length >= limit);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Unable to load services. Please try again later.");
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setPageLoading(false);
      }
    },
    [limit]
  );

  // initial load
  useEffect(() => {
    fetchServices(1, false);
  }, [fetchServices]);

  // fetch subsequent pages when page state changes
  useEffect(() => {
    if (page === 1) return;
    fetchServices(page, true);
  }, [page, fetchServices]);

  // observer to attach to last item
  const lastServiceRef = useCallback(
    (node) => {
      if (loading || pageLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { rootMargin: "200px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, pageLoading, hasMore]
  );

  // render states
  if (loading && services.length === 0) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Our Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => {
            setPage(1);
            fetchServices(1, false);
          }}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 py-22">
      <h1 className="text-3xl md:text-3xl font-bold mb-8 text-gray-800">Our Services</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {services.map((service, index) => {
          const isLast = index === services.length - 1;
          return (
            <Link
              key={service._id}
              to={`/service/${service._id}`}
              className="group bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
              ref={isLast ? lastServiceRef : null}
            >
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="p-5 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {service.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
                <span className="font-bold text-lg text-gray-900">₹{service.price}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* bottom loader / end indicator */}
      <div className="mt-8">
        {pageLoading && <Spinner text="Loading more services..." />}
        {!hasMore && (
          <div className="text-center text-gray-500 py-6">You’ve reached the end of the list.</div>
        )}
      </div>
    </div>
  );
}
