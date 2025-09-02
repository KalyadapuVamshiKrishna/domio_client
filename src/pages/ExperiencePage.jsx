import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    axios.get("/experiences").then((response) => {
       console.log("API Response:", response.data);
      setExperiences(response.data);
    });
  }, []);

  return (
    <div className="mt-16 px-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      
        {console.log("Bookings:", experiences)}

       {experiences.map((exp) => (
          <Link
            to={`/experiences/${exp._id}`}
            key={exp._id}
            className="block hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
             
                <img
                  className="w-full h-48 object-cover"
                  src={exp.photos}
                  alt={exp.title}
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
        ))}
    </div>
  );
}
