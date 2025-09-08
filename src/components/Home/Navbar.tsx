import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
    <div className="flex items-center space-x-2">
      <span className="font-bold text-xl">NaiUdaan Library</span>
    </div>
    <div className="flex items-center space-x-4">
      <Link to="/login" className="px-4 py-2 rounded bg-white text-slate-800 font-semibold hover:bg-gray-200 transition-colors">Login</Link>
    </div>
  </nav>
);

export default Navbar;
