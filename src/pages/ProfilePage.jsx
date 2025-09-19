import { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage.jsx";
import AccountNav from "../components/Account/AccountNav.jsx";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Home, Briefcase, LogOut, Calendar } from "lucide-react";

export default function ProfilePage() {
   const { t } = useTranslation();
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
   const [stats, setStats] = useState({ tripsCount: 0, listingsCount: 0 })
  let { subpage } = useParams();
  if (!subpage) subpage = "profile";

  async function logout() {
    await axios.post("/logout");
    setUser(null);
    setRedirect("/");
  }

  useEffect(() => {
    if (ready && user) {
      axios.get("/profile/stats",  { withCredentials: true }).then(({ data }) => {
        setStats(data);
      });
    }
  }, [ready, user]);

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (ready && !user && !redirect) return <Navigate to="/login" />;
  if (redirect) return <Navigate to={redirect} />;

  // derive join date from MongoDB ObjectId
  function getJoinDate(id) {
    if (!id) return "";
    const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6">
      <AccountNav />

      {subpage === "profile" && (
        <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-md p-8 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <h2 className="text-2xl font-bold mb-1 text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">Role: {user.role}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since {getJoinDate(user._id)}
          </p>

         <div className={`grid gap-6 mt-8 ${
    user.role === "host" ? "grid-cols-2" : "grid-cols-1 justify-center"
  }`}><Link
              to="/account/bookings"
              className="flex flex-col items-center p-5 bg-gray-50 rounded-xl shadow hover:bg-gray-100 transition"
            >
              <Calendar className="w-6 h-6 text-indigo-500 mb-2" />
              <p className="text-lg font-bold text-gray-800">
                {stats.tripsCount}
              </p>
              <p className="text-sm text-gray-500">Trips</p>
            </Link>

            {/* Host-only: Listings */}
            {user.role === "host" && (
              <Link
                to="/account/places"
                className="flex flex-col items-center p-5 bg-gray-50 rounded-xl shadow hover:bg-gray-100 transition"
              >
                <Home className="w-6 h-6 text-purple-500 mb-2" />
                <p className="text-lg font-bold text-gray-800">
                  {stats.listingsCount}
                </p>
                <p className="text-sm text-gray-500">Listings</p>
              </Link>
            )}
          </div>
          {/* Logout Button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="destructive"
              size="lg"
              onClick={logout}
              className="w-full max-w-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      )}

      {subpage === "places" && <PlacesPage />}
    </div>
  );
}
