import { Link, Navigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../Context/UserContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);

  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  
  // New: Error state
  const [errorMessage, setErrorMessage] = useState(null);

  // Helper to clear errors when user types
  useEffect(() => {
    setErrorMessage(null);
  }, [email, password]);

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const { data } = await axios.post('/login', { email, password });
      setUser(data);
      setRedirect(true);
    } catch (e) {
      // Professional Error Handling
      const message = e.response?.data?.message || e.response?.data || "Login failed. Please check your network.";
      setErrorMessage(message);
      console.error("Login Error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setGuestLoading(true);
    setErrorMessage(null);

    try {
      const guestCredentials = {
        email: "curiuskrish@gmail.com",
        password: "Vamshi@4737"
      };
      const { data } = await axios.post('/login', guestCredentials, { withCredentials: true });
      setUser(data);
      setRedirect(true);
    } catch (e) {
      const message = e.response?.data?.message || "Guest login failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setGuestLoading(false);
    }
  }

  if (redirect) return <Navigate to="/" />;

  return (
    <div className="flex grow items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Welcome Back</h1>
        
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          
          {/* ✅ Professional Error Display */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {/* Requires lucide-react, or remove this line */}
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              type="email"
              id="login-email"
              placeholder="your@email.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              required
             
              className={errorMessage ? "border-red-300 focus-visible:ring-red-200" : ""}
            />
          </div>

         <div>
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"} 
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                // 2. Fix the variable name to errorMessage
                className={`pr-10 ${errorMessage ? "border-red-300" : ""}`} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {/* 3. Logic check: Eye usually means "Show" and EyeOff means "Hide" */}
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading || guestLoading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGuestLogin}
            disabled={guestLoading || loading}
          >
            {guestLoading ? "Logging in as Guest..." : "Login as Guest"}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-black font-medium hover:text-gray-700">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}