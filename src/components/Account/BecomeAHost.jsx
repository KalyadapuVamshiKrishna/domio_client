import { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { user, setUser, ready } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!ready) {
    // Show loading while context fetches user
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  if (ready && !user) {
    // No user logged in
    return <p className="text-center mt-10 text-gray-500">You need to log in.</p>;
  }

  const handleBecomeHost = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/users/become-host");
      setUser({ ...user, role: res.data.role });
      setIsModalOpen(false);
      alert("You are now a host!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to become a host");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Welcome, {user?.name || "User"}!
      </h1>

      {user.role === "customer" && (
        <div className="flex justify-center">
          <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl">
                Become a Host
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Host Role</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to become a host? This will allow you to list your places and experiences.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBecomeHost} disabled={loading}>
                  {loading ? "Processing..." : "Confirm"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {user.role === "host" && (
        <Card className="mt-6 p-4 sm:p-6 shadow-lg">
          <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <p className="text-lg sm:text-xl font-semibold">
              You are now a host! Start listing your places and experiences.
            </p>
            <Button
              className="mt-3 sm:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
              onClick={() => window.location.href = "/host/dashboard"}
            >
              Go to Host Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
