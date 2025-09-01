import { useEffect, useState } from "react";
import axios from "axios";
import {Link} from "react-router-dom";

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
    return <div className="p-4 text-center">Loading services...</div>;
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link key={service._id} to={`/service/${service._id}`} className="group">
            <div
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 cursor-pointer"
            >
              <img
              src={service.image}
              alt={service.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{service.description}</p>
              <p className="text-gray-800 font-bold">${service.price}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
