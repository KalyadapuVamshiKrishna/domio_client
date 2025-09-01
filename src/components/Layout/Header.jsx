import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../Context/UserContext";
import { Globe, Menu, User, Search } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("Home");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const isAuthenticated = !!user;
  const userRole = user?.role || "customer";
  const navigate = useNavigate();

  const tabs = ["Home", "Experiences", "Services"];

  function handleSearch() {
    if (!location) return; // optional: prevent empty search
  const params = new URLSearchParams({ query: location, checkIn, checkOut, guests }).toString();
  navigate(`/?${params}`);
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
    <nav className={`fixed top-0 w-full z-50 transition-all ${isScrolled ? "bg-white shadow-md" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 gap-4">

        {/* Left: Logo */}
        <Link to="/" className="flex-shrink-0">
          <motion.img
            src="/airbnb_logo.png"
            alt="Domio"
            className="cursor-pointer"
            initial={{ width: "140px" }}
            animate={{ width: isScrolled ? "60px" : "100px", scale: isScrolled ? 0.95 : 1 }}
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
                {tabs.map(tab => {
                  const route = tab === "Home" ? "/" : tab === "Experiences" ? "/experiences" : "/services";
                  return (
                    <Link
                      key={tab}
                      to={route}
                      className={`pb-2 cursor-pointer ${activeTab === tab ? "border-b-2 border-black" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Link>
                  );
                })}
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
                    <label className="text-xs font-semibold mb-1">Where</label>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-sm outline-none placeholder-gray-400"
                    />
                  </div>
                  <div className="border-l h-10 border-gray-300" />
                  <div className="flex flex-col flex-grow min-w-[90px]">
                    <label className="text-xs font-semibold mb-1">Check in</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="text-sm outline-none"/>
                  </div>
                  <div className="border-l h-10 border-gray-300" />
                  <div className="flex flex-col flex-grow min-w-[90px]">
                    <label className="text-xs font-semibold mb-1">Check out</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="text-sm outline-none"/>
                  </div>
                  <div className="border-l h-10 border-gray-300" />
                  <div className="flex flex-col flex-grow w-4">
                    <label className="text-xs font-semibold mb-1">Who</label>
                    <input type="number" placeholder="Guests" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="text-sm outline-none placeholder-gray-400"/>
                  </div>
                  <button onClick={handleSearch} className="flex-shrink-0 bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600">
                    <Search className="w-4 h-4"/>
                  </button>
                </motion.div>
              ) : (
                <div className="flex justify-between items-center text-gray-600 text-sm w-full px-4">
                  <span className="cursor-pointer hover:underline">Anywhere</span>
                  <span>·</span>
                  <span>Any week</span>
                  <span>·</span>
                  <span>Add guests</span>
                  <button onClick={handleSearch} className="ml-2 bg-rose-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-rose-600">
                    <Search className="w-4 h-4"/>
                  </button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right: Independent Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && userRole === "customer" && (
            <Link to="/become-host" className="hidden sm:inline text-sm font-medium hover:underline whitespace-nowrap">
              Become a host
            </Link>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="text-sm font-medium hover:underline whitespace-nowrap">
              Login
            </Link>
          )}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Globe className="w-5 h-5"/>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 border rounded-full px-3 py-2 cursor-pointer hover:shadow-md transition">
              <Menu className="w-5 h-5"/>
              <User className="w-5 h-5"/>
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
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
