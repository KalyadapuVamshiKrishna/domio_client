import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default role
  const [loading, setLoading] = useState(false);

  async function registerUser(ev) {
    ev.preventDefault();
    setLoading(true); 
    try {
      await axios.post(
        '/register',
        { name, email, password, role },
        { withCredentials: true }
      );
      alert('Registration successful. You can now log in.');
      navigate('/login'); // navigate to login page
    } catch (e) {
      alert('Registration failed. Please try again.');
      console.error({ message: e });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex grow items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
        <form className="space-y-4" onSubmit={registerUser}>
          
          {/* Name Input */}
          <div>
            <Label htmlFor="signup-name">Name</Label>
            <Input
              type="text"
              id="signup-name"
              name="name"
              placeholder="Your full name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              autoComplete="name"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              type="email"
              id="signup-email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <Label htmlFor="signup-password">Password</Label>
            <Input
              type="password"
              id="signup-password"
              name="password"
              placeholder="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label>Select Role</Label>
            <div className="flex gap-4 mt-2">
              <label htmlFor="role-customer" className="flex items-center gap-2">
                <input
                  type="radio"
                  id="role-customer"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="accent-blue-500"
                />
                Customer
              </label>

              <label htmlFor="role-host" className="flex items-center gap-2">
                <input
                  type="radio"
                  id="role-host"
                  name="role"
                  value="host"
                  checked={role === "host"}
                  onChange={() => setRole("host")}
                  className="accent-blue-500"
                />
                Host
              </label>
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-4">
          Already a member?{' '}
          <Link to="/login" className="underline text-black font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
