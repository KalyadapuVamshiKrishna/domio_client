import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const { i18n } = useTranslation();
  const isAuthenticated = !!user;
  const userRole = user?.role || "customer";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Experiences", path: "/experiences", icon: <Compass className="w-4 h-4" /> },
    { name: "Services", path: "/services", icon: <Briefcase className="w-4 h-4" /> },
  ];

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedLocation = useDebounce(locationInput, 300);

  // Fetch search results and auto-navigate ONLY when on home page
  useEffect(() => {
    if (!debouncedLocation) {
      setSearchResults([]);
      // If user clears search while on home page, clear URL params
      if (pathname === '/') {
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.has('location')) {
          navigate('/', { replace: true });
        }
      }
      return;
    }

    const fetchListings = async () => {
      try {
        let endpoint = '';
        
        
        switch (pathname) {
          case '/':
            endpoint = `/places?search=${debouncedLocation}`;
            break;
          case '/experiences':
            endpoint = `/experiences?search=${debouncedLocation}`;
            break;
          case '/services':
            endpoint = `/services?search=${debouncedLocation}`;
            break;
          default:
            endpoint = `/places?search=${debouncedLocation}`;
        }

        const res = await axios.get(endpoint);
        setSearchResults(res.data);
        
      
        const params = new URLSearchParams({
          location: debouncedLocation,
          checkIn,
          checkOut,
          guests,
        }).toString();
        
        
        navigate(`${pathname}?${params}`, { replace: true });
        
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setSearchResults([]);
      }
    };

    fetchListings();
  }, [debouncedLocation, pathname, checkIn, checkOut, guests, navigate]);

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location') || '';
    const checkInParam = urlParams.get('checkIn') || '';
    const checkOutParam = urlParams.get('checkOut') || '';
    const guestsParam = urlParams.get('guests') || '1';

    setLocationInput(location);
    setCheckIn(checkInParam);
    setCheckOut(checkOutParam);
    setGuests(guestsParam);
  }, []);

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Navigate when user explicitly searches - now respects current tab
  const handleSearch = () => {
    if (!locationInput) return;
    
    const params = new URLSearchParams({
      location: locationInput,
      checkIn,
      checkOut,
      guests,
    }).toString();
    
    // Navigate to current tab or home if on unknown route
    const targetPath = ['/experiences', '/services'].includes(pathname) ? pathname : '/';
    navigate(`${targetPath}?${params}`);
    setSearchOpen(false);
    setSearchResults([]); // Clear search dropdown
  };

  // Handle selecting a search result - now navigates to appropriate detail page
  const handleSearchResultClick = (item) => {
    let detailRoute = '';
    
    // Determine detail route based on current tab
    switch (pathname) {
      case '/experiences':
        detailRoute = `/experience/${item.id}`;
        break;
      case '/services':
        detailRoute = `/service/${item.id}`;
        break;
      default:
        detailRoute = `/listing/${item.id}`;
    }
    
    navigate(detailRoute);
    setLocationInput(item.name || item.title);
    setSearchResults([]);
  };

  // Clear search when navigating away from home
  useEffect(() => {
    if (pathname !== '/') {
      setSearchResults([]);
    }
  }, [pathname]);

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
                width: isScrolled ? "40px" : "100px",
                scale: isScrolled ? 2 : 1,
                
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
            />
          </Link>

          {/* Center: Tabs + Search */}
          <div className="hidden md:flex flex-col flex-1 items-center relative">
            {/* Tabs */}
            <AnimatePresence mode="wait">
              {isScrolled ? (
                <motion.div
                  key="collapsed-tabs"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex gap-8 text-sm font-medium justify-center"
                >
                  {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                      <Link
                        key={tab.name}
                        to={tab.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                          isActive
                            ? "text-rose-600 bg-rose-50 shadow-sm"
                            : "text-gray-600 hover:text-rose-500 hover:bg-gray-100"
                        }`}
                      >
                        <span className={`${isActive ? "text-rose-600" : "text-gray-500"}`}>
                          {tab.icon}
                        </span>
                        <span className="hidden sm:inline">{tab.name}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="expanded-tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex gap-6 mb-2 text-sm  font-medium flex-wrap justify-center"
                >
                  {tabs.map((tab) => (
                    <Link
                      key={tab.name}
                      to={tab.path}
                      className={`pb-2  cursor-pointer ${
                        pathname === tab.path ? "border-b-2 text-rose-600 border-rose-600" : ""
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
              className="bg-white shadow-md border flex items-center w-full max-w-lg overflow-hidden relative"
              animate={{
                width: isScrolled ? "0%" : "100%",
                opacity: isScrolled ? 0 : 1,
                borderRadius: isScrolled ? "0" : "2rem",
                padding: isScrolled ? "0" : "0.8rem 1rem",
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                {!isScrolled && (
                  <motion.div
                    key="expanded"
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex items-center gap-4 w-full min-w-0 relative"
                  >
                    <div className="flex flex-col flex-grow min-w-[119px] relative">
                      <label className="text-xs font-semibold mb-1">Where</label>
                      <input
                        type="text"
                        placeholder="Search destinations"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="text-sm outline-none placeholder-gray-400"
                      />

                      {/* Dropdown Results */}
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto z-50">
                          {searchResults.map((listing) => (
                            <div
                              key={listing.id}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSearchResultClick(listing)}
                            >
                              {listing.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-l h-10 border-gray-300" />

                    {/* Check-in */}
                    <div className="flex flex-col flex-grow min-w-[100px]">
                      <label className="text-xs font-semibold mb-1">Check in</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="text-sm outline-none"
                      />
                    </div>

                    <div className="border-l h-10 border-gray-300" />

                    {/* Check-out */}
                    <div className="flex flex-col flex-grow min-w-[100px]">
                      <label className="text-xs font-semibold mb-1">Check out</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="text-sm outline-none"
                      />
                    </div>

                    <div className="border-l h-10 border-gray-300" />

                    {/* Guests */}
                    <div className="flex flex-col flex-grow min-w-[20px]">
                      <label className="text-xs font-semibold mb-1">Who</label>
                      <input
                        type="number"
                        placeholder="Guests"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="text-sm text-center outline-none placeholder-gray-400"
                      />
                    </div>

                    <button
                      onClick={handleSearch}
                      className="flex-shrink-0 bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </motion.div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                  <Globe className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage("hi")}>
                  हिन्दी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage("fr")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage("es")}>
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                      <Link to="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    {user.role === "host" && (
                      <DropdownMenuItem asChild>
                        <Link to="/account/places">My Listings</Link>
                      </DropdownMenuItem>
                    )}
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
      <div className="fixed bottom-0 left-0 w-full gap-10 p-4 bg-white shadow-md flex justify-around py-2 md:hidden z-50 border-t">
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
      {/* Location */}
      <input
        type="text"
        placeholder="Where are you going?"
        className="border p-3 rounded-lg"
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
      />

      {/* Check-in */}
      <DatePicker
        selected={checkIn}
        onChange={(date) => setCheckIn(date)}
        placeholderText="Check-in"
        minDate={new Date()} // block past dates
        selectsStart
        startDate={checkIn}
        endDate={checkOut}
        className="border p-3 rounded-lg w-full"
      />

      {/* Check-out */}
      <DatePicker
        selected={checkOut}
        onChange={(date) => setCheckOut(date)}
        placeholderText="Check-out"
        minDate={checkIn || new Date()}
        selectsEnd
        startDate={checkIn}
        endDate={checkOut}
        className="border p-3 rounded-lg w-full"
      />

      {/* Guests */}
      <input
        type="number"
        min="1"
        placeholder="Guests"
        className="border p-3 rounded-lg"
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
      />

      {/* Search button */}
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