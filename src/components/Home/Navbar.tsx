import React, {useState} from "react";
import {Link} from "react-router-dom";
import {LogIn, LayoutDashboard} from "lucide-react";
import {useAuth} from "../../contexts/AuthContext";

interface NavbarProps {
  onLoginClick?: () => void;
  onHomeClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({onLoginClick, onHomeClick}) => {
  const {isAuthenticated} = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => {
            onHomeClick?.();
            window.scrollTo({top: 0, behavior: "smooth"});
          }}
          className="font-extrabold text-xl tracking-tight text-gray-900"
        >
          NaiUdaan <span className="text-blue-600">Library</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <button
            onClick={() => {
              onHomeClick?.();
              window.scrollTo({top: 0, behavior: "smooth"});
            }}
            className="hover:text-blue-600"
          >
            Home
          </button>
          <a href="#features" className="hover:text-blue-600">
            Features
          </a>
          <a href="#location" className="hover:text-blue-600">
            Location
          </a>
          <a
            href="https://share.google/uO9KCuJRtlaP8ctAI"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600"
          >
            Reviews
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-gray-900 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-900 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-900" />
        </button>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <LogIn className="w-4 h-4" /> Admin Login
            </button>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-gray-700">
            <button
              onClick={() => {
                onHomeClick?.();
                setOpen(false);
                window.scrollTo({top: 0, behavior: "smooth"});
              }}
              className="text-left py-2 hover:text-blue-600"
            >
              Home
            </button>
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#location"
              onClick={() => setOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              Location
            </a>
            <a
              href="https://share.google/uO9KCuJRtlaP8ctAI"
              target="_blank"
              rel="noreferrer"
              className="py-2 hover:text-blue-600"
            >
              Reviews
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
