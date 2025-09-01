import { useContext, useState } from "react";
import { UserContext } from "../Context/UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage.jsx";
import AccountNav from "../components/Account/AccountNav.jsx";

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

  if (!ready) return <p className="text-center mt-10">Loading...</p>;
  if (ready && !user && !redirect) return <Navigate to="/login" />;
  if (redirect) return <Navigate to={redirect} />;

  return (
    <div className="px-4 md:px-8 lg:px-16 py-6">
      <AccountNav />

      {subpage === "profile" && (
        <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Information</h2>
          <p className="text-gray-700 mb-4">
            Logged in as <span className="font-medium">{user.name}</span> (
            <span className="font-mono">{user.email}</span>)
          </p>
          <button
            onClick={logout}
            className="bg-red-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}

      {subpage === "places" && <PlacesPage />}
    </div>
  );
}
