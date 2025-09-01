import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex grow items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
        <form className="space-y-4" onSubmit={registerUser}>
          <div>
            <Label>Full Name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={ev => setName(ev.target.value)}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={ev => setEmail(ev.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label>Select Role</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="accent-blue-500"
                />
                Customer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="host"
                  checked={role === 'host'}
                  onChange={() => setRole('host')}
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
