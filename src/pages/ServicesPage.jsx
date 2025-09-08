import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/services").then((response) => {
      setServices(response.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 text-lg animate-pulse">
        Loading services...
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
        Our Services
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {services.map((service) => (
          <Link
            key={service._id}
            to={`/service/${service._id}`}
            className="group bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
          >
            <div className="relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
            </div>
            <div className="p-5 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {service.title}
              </h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>
              <span className="font-bold text-lg text-gray-900">
                ₹{service.price}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
