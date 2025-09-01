import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../components/Account/AccountNav";
import PlaceImg from "../components/Places/PlaceImg";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("/user-places").then(({ data }) => setPlaces(data));
  }, []);

  return (
    <div className="px-4 md:px-8 lg:px-16 py-6">
      <AccountNav />

      <div className="flex justify-center my-6">
        <Link
          to="/account/places/new"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2 px-6 rounded-full shadow hover:bg-primary/80 transition"
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
          Add new place
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {places.length > 0 &&
          places.map((place) => (
            <Link
              key={place._id}
              to={`/account/places/${place._id}`}
              className="group relative flex flex-col bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative w-full h-48 bg-gray-200">
                <PlaceImg place={place} />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
                  {place.title}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="text-gray-600 text-sm line-clamp-3">{place.description}</p>
              </div>
            </Link>
          ))}
      </div>

      {places.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          You don’t have any places yet. Start by adding a new place.
        </p>
      )}
    </div>
  );
}
