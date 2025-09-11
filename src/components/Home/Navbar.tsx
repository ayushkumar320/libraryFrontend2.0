import React from "react";
import {Link} from "react-router-dom";
import {LogIn, LayoutDashboard} from "lucide-react";
import {useAuth} from "../../contexts/AuthContext";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({onLoginClick}) => {
  const {isAuthenticated} = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-extrabold text-xl tracking-tight text-gray-900"
        >
          NaiUdaan <span className="text-blue-600">Library</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
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
    </header>
  );
};

export default Navbar;
