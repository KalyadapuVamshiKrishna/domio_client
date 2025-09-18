import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../components/Account/AccountNav";
import PlaceImg from "../components/Places/PlaceImg";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("/user-places",  { withCredentials: true }).then(({ data }) => setPlaces(data));
  }, []);

  return (
    <div className="px-4 md:px-8 lg:px-16 py-8">
      {/* ✅ Account Navigation */}
      <AccountNav />

      {/* ✅ Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Your Places
        </h1>
        <Link
          to="/account/places/new"
          className="inline-flex items-center gap-2 bg-rose-500 text-white font-semibold py-2 px-6 rounded-full shadow hover:bg-rose-600 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Add New Place
        </Link>
      </div>

      {/* ✅ Places Grid */}
      {places.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Link
              key={place._id}
              to={`/account/places/${place._id}`}
              className="group flex flex-col"
            >
              {/* Image Section */}
              <div className="relative w-full h-56 overflow-hidden rounded-xl">
                <PlaceImg
                  place={place}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
              </div>

              {/* Details Section */}
              <div className="mt-3 flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {place.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {place.description}
                </p>
                {/* Optional: Price & Rating */}
                {place.price && (
                  <p className="mt-1 text-gray-800 font-semibold">
                    ₹{place.price}{" "}
                    <span className="text-gray-500 text-sm">/ night</span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* ✅ Empty State */
        <div className="text-center mt-16">
          <p className="text-gray-500 text-lg mb-4">
            You don’t have any places yet.
          </p>
          <Link
            to="/account/places/new"
            className="bg-rose-500 text-white font-semibold py-2 px-6 rounded-full shadow hover:bg-rose-600 transition"
          >
            Add Your First Place
          </Link>
        </div>
      )}
    </div>
  );
}
