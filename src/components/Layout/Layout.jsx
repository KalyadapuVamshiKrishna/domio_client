import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register"];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      {/* Header / Navbar */}
      {shouldShowHeader && <Header />}

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Outlet />
      </main>

      {/* Updated Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600">
        <FooterColumn
          title="Support"
          links={["Help Center", "Safety", "Cancellation options"]}
        />
        <FooterColumn
          title="Community"
          links={["Airbnb.org", "Accessibility", "Diversity"]}
        />
        <FooterColumn
          title="Hosting"
          links={["Try hosting", "AirCover for Hosts", "Explore hosting resources"]}
        />
        <FooterColumn
          title="About"
          links={["Newsroom", "Careers", "Investors"]}
        />
      </div>
      <div className="border-t mt-6 pt-4 flex justify-between items-center max-w-7xl mx-auto px-6 text-sm text-gray-500">
        <p>© 2025 Airbnb clone. No rights reserved.</p>
        <div className="flex gap-4">
          <span>🌐 English (IN)</span>
          <span>₹ INR</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-1">
        {links.map((link, idx) => (
          <li key={idx} className="hover:underline cursor-pointer">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}
