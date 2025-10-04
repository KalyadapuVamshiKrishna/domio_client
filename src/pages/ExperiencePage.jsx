// client/src/pages/ExperiencesPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Spinner loader
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
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <span className="text-gray-600">{text}</span>
    </div>
  );
}

// Skeleton loader
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 12;
  const fetchingRef = useRef(false);
  const observerRef = useRef(null);

  const fetchExperiences = useCallback(
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
        const res = await axios.get("/experiences", {
          params: { page: pageToFetch, limit },
        });
        const fetched = Array.isArray(res.data) ? res.data : [];
        setExperiences((prev) =>
          append ? [...prev, ...fetched] : fetched
        );
        setHasMore(fetched.length >= limit);
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
        setError("Unable to load experiences. Please try again later.");
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setPageLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchExperiences(1, false);
  }, [fetchExperiences]);

  useEffect(() => {
    if (page === 1) return;
    fetchExperiences(page, true);
  }, [page, fetchExperiences]);

  const lastExpRef = useCallback(
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

  // Skeleton
  if (loading && experiences.length === 0) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-26">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
          Experiences
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => {
            setPage(1);
            fetchExperiences(1, false);
          }}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 py-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
        Unique Experiences
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {experiences.map((exp, index) => {
          const isLast = index === experiences.length - 1;
          return (
            <Link
              to={`/experiences/${exp._id}`}
              key={exp._id}
              ref={isLast ? lastExpRef : null}
              className="group bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
            >
              <div className="relative">
                <img src={exp.coverPhoto || (Array.isArray(exp.photos) ? exp.photos[0] : exp.photos)}
                  alt={exp.title}
                  loading="lazy"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium text-gray-700">
                  {exp.duration ? `${exp.duration} hrs` : "Flexible"}
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {exp.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {exp.location || "India"}
                  </p>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-rose-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.905c.969 0 1.371 1.24.588 1.81l-3.972 2.886 1.518 4.674c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.968 2.842c-.784.57-1.838-.197-1.539-1.118l1.517-4.674-3.972-2.886c-.783-.57-.38-1.81.588-1.81h4.905l1.518-4.674z" />
                  </svg>
                  <span className="font-medium text-gray-800">
                    {exp.rating ? exp.rating.toFixed(1) : "New"}
                  </span>
                  {exp.reviewsCount ? (
                    <span className="ml-1 text-gray-500">
                      ({exp.reviewsCount})
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  <span className="font-bold text-lg text-gray-900">
                    ₹{exp.price}
                  </span>{" "}
                  <span className="text-gray-500 text-sm">per person</span>
                </div>

                {exp.host?.name && (
                  <p className="mt-2 text-sm text-gray-500">
                    Hosted by <span className="font-medium">{exp.host.name}</span>
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        {pageLoading && <Spinner text="Loading more experiences..." />}
        {!hasMore && (
          <div className="text-center text-gray-500 py-6">
            You’ve reached the end of the list.
          </div>
        )}
      </div>
    </div>
  );
}
