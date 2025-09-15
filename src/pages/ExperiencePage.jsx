// client/src/pages/ExperiencesPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const listEndRef = useRef(null);
  const limit = 12;

  const fetchExperiences = useCallback(
    async (pageToFetch = 1, append = false) => {
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
        setLoading(false);
        setPageLoading(false);
      }
    },
    []
  );

  // initial fetch
  useEffect(() => {
    fetchExperiences(1, false);
  }, [fetchExperiences]);

  // fetch next pages
  useEffect(() => {
    if (page === 1) return;
    fetchExperiences(page, true);
  }, [page, fetchExperiences]);

  // infinite scroll observer
  const lastExpRef = useCallback(
    (node) => {
      if (loading || pageLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      }, { rootMargin: "200px" });

      if (node) observerRef.current.observe(node);
    },
    [loading, pageLoading, hasMore]
  );

  if (loading && experiences.length === 0) {
    return <div className="text-center py-10">Loading experiences...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        {error} <br />
        <button
          onClick={() => fetchExperiences(1, false)}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Experiences</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {experiences.map((exp, index) => {
          const isLast = index === experiences.length - 1;
          return (
            <Link
              to={`/experiences/${exp._id}`}
              key={exp._id}
              className="block hover:scale-105 transition-transform duration-300"
              ref={isLast ? lastExpRef : null}
            >
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
                <img
                  className="w-full h-48 object-cover"
                  src={exp.photos}
                  alt={exp.title}
                  loading="lazy"
                />
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h2 className="font-semibold text-lg mb-1">{exp.title}</h2>
                  <h3 className="text-sm text-gray-500 mb-2">{exp.location}</h3>
                  <div className="mt-auto">
                    <span className="font-bold text-lg text-gray-800">
                      ₹{exp.price}
                    </span>{" "}
                    <span className="text-gray-500 text-sm">/ person</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* bottom loader / end */}
      <div ref={listEndRef}>
        {pageLoading && <div className="text-center py-6">Loading more...</div>}
        {!hasMore && (
          <div className="text-center text-gray-500 py-6">
            You’ve reached the end of the list.
          </div>
        )}
      </div>
    </div>
  );
}
