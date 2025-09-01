import {Link, Navigate} from "react-router-dom";
import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "../Context/UserContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const {setUser} = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    setLoading(true);
    try {
      const {data} = await axios.post('/login', {email,password});
      setUser(data);
      setRedirect(true);
    } catch (e) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  if (redirect) return <Navigate to={'/'} />;

  return (
    <div className="flex grow items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
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
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-black font-medium">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
