import { useContext, useState } from "react";
import { UserContext } from "../Context/UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage.jsx";
import AccountNav from "../components/Account/AccountNav.jsx";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  let { subpage } = useParams();
  if (!subpage) subpage = "profile";

  async function logout() {
    await axios.post("/logout");
    setUser(null);
    setRedirect("/");
  }

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (ready && !user && !redirect) return <Navigate to="/login" />;
  if (redirect) return <Navigate to={redirect} />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6">
      <AccountNav />

      {subpage === "profile" && (
        <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Logged in as <span className="font-medium">{user.name}</span> (
            <span className="font-mono">{user.email}</span>)
          </p>
          <div className="flex justify-center gap-4">
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
