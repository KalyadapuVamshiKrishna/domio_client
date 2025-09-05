import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../Context/UserContext";
import {
  Globe,
  Menu,
  User,
  Search,
  Home,
  Compass,
  Briefcase,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

export default function Header() {
  const { user, setUser } = useContext(UserContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);

  const isAuthenticated = !!user;
  const userRole = user?.role || "customer";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { name: "Home", path: "/" },
    { name: "Experiences", path: "/experiences" },
    { name: "Services", path: "/services" },
  ];

  function handleSearch() {
    if (!locationInput) return;
    const params = new URLSearchParams({
      location: locationInput,
      checkIn,
      checkOut,
      guests,
    }).toString();
    navigate(`/?${params}`);
    setSearchOpen(false);
  }

  async function handleLogout() {
    try {
      await axios.post("/logout");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all ${
          isScrolled ? "bg-white shadow-md" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.img
              src="/airbnb_logo.png"
              alt="Domio"
              className="cursor-pointer"
              initial={{ width: "140px" }}
              animate={{
                width: isScrolled ? "60px" : "100px",
                scale: isScrolled ? 0.95 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
            />
          </Link>

          {/* Center: Tabs + Search */}
          <div className="hidden md:flex flex-col flex-1 items-center">
            {/* Tabs */}
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  key="tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-6 mb-2 text-sm font-medium flex-wrap justify-center"
                >
                  {tabs.map((tab) => (
                    <Link
                      key={tab.name}
                      to={tab.path}
                      className={`pb-2 cursor-pointer ${
                        pathname === tab.path ? "border-b-2 border-black" : ""
                      }`}
                    >
                      {tab.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <motion.div
              className="bg-white shadow-md border flex items-center w-full max-w-lg overflow-hidden"
              animate={{
                width: isScrolled ? "40%" : "100%",
                borderRadius: isScrolled ? "9999px" : "2rem",
                padding: isScrolled ? "0.4rem 1rem" : "0.8rem 1rem",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                {!isScrolled ? (
                  <motion.div className="flex items-center gap-4 w-full min-w-0">
                    <div className="flex flex-col flex-grow min-w-[100px]">
                      <label className="text-xs font-semibold mb-1">
                        Where
                      </label>
                      <input
                        type="text"
                        placeholder="Search destinations"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="text-sm outline-none placeholder-gray-400"
                      />
                    </div>
                    <div className="border-l h-10 border-gray-300" />
                    <div className="flex flex-col flex-grow min-w-[90px]">
                      <label className="text-xs font-semibold mb-1">
                        Check in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="text-sm outline-none"
                      />
                    </div>
                    <div className="border-l h-10 border-gray-300" />
                    <div className="flex flex-col flex-grow min-w-[90px]">
                      <label className="text-xs font-semibold mb-1">
                        Check out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="text-sm outline-none"
                      />
                    </div>
                    <div className="border-l h-10 border-gray-300" />
                    <div className="flex flex-col flex-grow w-4">
                      <label className="text-xs font-semibold mb-1">Who</label>
                      <input
                        type="number"
                        placeholder="Guests"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="text-sm outline-none placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="flex-shrink-0 bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex justify-between items-center text-gray-600 text-sm w-full px-4">
                    <span className="cursor-pointer hover:underline">
                      Anywhere
                    </span>
                    <span>·</span>
                    <span>Any week</span>
                    <span>·</span>
                    <span>Add guests</span>
                    <button
                      onClick={handleSearch}
                      className="ml-2 bg-rose-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-rose-600"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right: Menu + Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated && userRole === "customer" && (
              <Link
                to="/become-host"
                className="hidden sm:inline text-sm font-medium hover:underline whitespace-nowrap"
              >
                Become a host
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-sm font-medium hover:underline whitespace-nowrap"
              >
                Login
              </Link>
            )}
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Globe className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 border rounded-full px-3 py-2 cursor-pointer hover:shadow-md transition">
                <Menu className="w-5 h-5" />
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/account">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/places">My Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/bookings">Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile search button */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Search className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md flex justify-around py-2 md:hidden z-50 border-t">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            pathname === "/" ? "text-rose-500" : "text-gray-500"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/experiences"
          className={`flex flex-col items-center ${
            pathname === "/experiences" ? "text-rose-500" : "text-gray-500"
          }`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-xs">Experiences</span>
        </Link>
        <Link
          to="/services"
          className={`flex flex-col items-center ${
            pathname === "/services" ? "text-rose-500" : "text-gray-500"
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-xs">Services</span>
        </Link>
        <Link
          to={isAuthenticated ? "/account" : "/login"}
          className={`flex flex-col items-center ${
            pathname.startsWith("/account")
              ? "text-rose-500"
              : "text-gray-500"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>

      {/* Search Modal for Mobile */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white z-50 p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Search</h2>
            <button onClick={() => setSearchOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Where are you going?"
              className="border p-3 rounded-lg"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <input
              type="date"
              className="border p-3 rounded-lg"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <input
              type="date"
              className="border p-3 rounded-lg"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Guests"
              className="border p-3 rounded-lg"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-rose-500 text-white py-3 rounded-lg"
            >
              Search
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
