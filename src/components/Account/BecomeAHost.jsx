import { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext.jsx";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { DollarSign, Users, Calendar, Home } from "lucide-react";


export default function Dashboard() {
  const { user, setUser, ready } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  if (ready && !user) {
    return <p className="text-center mt-10 text-gray-500">You need to log in.</p>;
  }

  


  const handleBecomeHost = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/users/become-host", {withCredentials: true});
      setUser({ ...user, role: res.data.role });
      alert("Congratulations! You’re now a host.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to become a host");
    } finally {
      setLoading(false);
    }
  };

 
 

  return (
    <div className="max-w-5xl mx-auto my-16 p-6">
      <h1 className="text-3xl sm:text-4xl font-bold  text-center">
        Welcome, <span className="text-rose-500">{user?.name || "User"}</span>!
      </h1>

      {user.role === "customer" && (
        <div className="space-y-10">
          {/* Hero Section */}
    <section className="grid grid-cols-1 sm:grid-cols-2 items-center gap-10 py-12">
      {/* Left Content */}
      <div className="text-left space-y-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Turn Your <span className="text-rose-500">Space</span> Into <br /> Steady Income
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Hosting isn’t just about sharing your space — it’s about creating memorable
          stays while unlocking <span className="font-semibold text-gray-800">passive income</span>. 
          Be in charge of your schedule, meet people from across the world, and make 
          your home work for you.
        </p>

        <ul className="space-y-3 text-gray-700 text-base">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            Earn money effortlessly with flexible hosting.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            Choose when your space is available — total control.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            Connect with travelers and share unique experiences.
          </li>
        </ul>
      </div>

      {/* Right Illustration */}
      <div className="flex justify-center">
        <img
          src="host.png"
          alt="Hosting illustration"
          className="w-full max-w-3md rounded-2xl "
        />
      </div>
    </section>


          {/* Benefits Section */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              <DollarSign className="w-10 h-10 mx-auto text-rose-500 mb-3" />
              <h3 className="font-semibold text-lg">Earn Extra Income</h3>
              <p className="text-gray-600 text-sm mt-1">
                Turn your unused space into a steady stream of income.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              <Users className="w-10 h-10 mx-auto text-rose-500 mb-3" />
              <h3 className="font-semibold text-lg">Meet New People</h3>
              <p className="text-gray-600 text-sm mt-1">
                Connect with travelers and share unique local experiences.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              <Calendar className="w-10 h-10 mx-auto text-rose-500 mb-3" />
              <h3 className="font-semibold text-lg">Flexible Hosting</h3>
              <p className="text-gray-600 text-sm mt-1">
                Host on your schedule — you decide when your place is available.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              <Home className="w-10 h-10 mx-auto text-rose-500 mb-3" />
              <h3 className="font-semibold text-lg">Share Your Space</h3>
              <p className="text-gray-600 text-sm mt-1">
                Create memorable stays and showcase your space to the world.
              </p>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="text-center">
            <Button
              onClick={handleBecomeHost}
              disabled={loading}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white px-8 py-4 rounded-2xl text-lg shadow-lg"
            >
              {loading ? "Processing..." : "Become a Host Today"}
            </Button>
          </section>
        </div>
      )}

      {user.role === "host" && (
        <div className="mt-10 text-center bg-gradient-to-r from-green-50 to-emerald-100 p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <Home className="w-7 h-7 text-green-600" />
            You’re officially a host!
          </h2>
          <p className="text-gray-700 mt-3 text-lg">
            Start listing your places and creating unique experiences for guests.
          </p>
          <Button
            className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow"
            onClick={() => (window.location.href = "/account")}
          >
            Go to Your Profile
          </Button>
        </div>
      )}
    </div>
  );
}
