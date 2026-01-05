import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react"; 
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // New States for Feedback
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Clear errors when the user changes any input
  useEffect(() => {
    setError(null);
  }, [name, email, password, role]);

  async function registerUser(ev) {
    ev.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        '/register',
        { name, email, password, role },
        { withCredentials: true }
      );
      
      setSuccess(true);
      // Wait 2 seconds so they can see the success message, then redirect
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (e) {
      // Handle the 409 Conflict specifically
      if (e.response?.status === 409) {
        setError("This email is already registered. Try logging in.");
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Registration failed. Please check your connection.");
      }
      console.error("Registration Error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex grow items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h1>
        
        <form className="space-y-4" onSubmit={registerUser}>
          
          {/* ✅ Success Feedback */}
          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          {/* ✅ Error Feedback */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label htmlFor="signup-name">Name</Label>
            <Input
              type="text"
              id="signup-name"
              placeholder="John Doe"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
              className={error ? "border-red-300" : ""}
            />
          </div>

          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              type="email"
              id="signup-email"
              placeholder="your@email.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              className={error && error.includes("email") ? "border-red-300" : ""}
            />
          </div>

         <div>
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"} 
                id="signup-password"
                placeholder="••••••••"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                className={`pr-10 ${error ? "border-red-300" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                   <Eye className="w-4 h-4" />
                ) : (

                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">I want to be a:</Label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm group-hover:text-black">Customer</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="role"
                  value="host"
                  checked={role === "host"}
                  onChange={() => setRole("host")}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm group-hover:text-black">Host</span>
              </label>
            </div>
          </div>

          <Button className="w-full mt-2" type="submit" disabled={loading || success}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Already a member?{' '}
          <Link to="/login" className="underline text-black font-medium hover:text-gray-700">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}