import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["About", "Skills", "Projects", "Journey", "Contact"];

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-7xl
        bg-white/40 backdrop-blur-xl rounded-full px-6 md:px-10 py-3 border border-white/50 transition-all duration-500
        ${scrolled ? 'shadow-[0_14px_60px_-24px_rgba(67,56,202,0.4)] scale-100' : 'shadow-[0_10px_40px_-26px_rgba(67,56,202,0.35)] scale-95'}`}
    >
      {/* Glow Rings */}
      <div className="absolute -z-10 inset-0 hidden md:block">
        <div className="w-40 h-40 bg-blue-400/20 blur-3xl absolute -top-12 -left-12 animate-pulse"></div>
        <div className="w-40 h-40 bg-purple-400/20 blur-3xl absolute -bottom-12 -right-12 animate-pulse"></div>
      </div>

      <div className="flex items-center justify-between relative h-16">

        {/* Left: Logo + Welcome */}
        <div className="flex items-center gap-4">
          <div
            className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-widest cursor-pointer
            hover:scale-110 hover:rotate-3 hover:text-white transition-all duration-500"
            onClick={() => handleScrollTo("about")}
          >
            ⬡
          </div>
          {user && (
            <div className="hidden md:block text-sm text-gray-700">
              Welcome, <span className="font-semibold text-indigo-600">{user.username}</span>
              {user.role === 'admin' && <span className="ml-2 text-xs text-purple-600">(Admin)</span>}
            </div>
          )}
        </div>

        {/* Center: Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-gray-700 font-semibold text-lg items-center">
          {navItems.map((item) => (
            <li key={item} className="group relative cursor-pointer">
              <span
                onClick={() => handleScrollTo(item.toLowerCase())}
                className="relative px-2 py-1 group-hover:text-indigo-700 transition-all duration-300"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-500"></span>
                <span className="absolute inset-x-0 -bottom-2 h-1.5 bg-indigo-500/20 opacity-0 group-hover:opacity-100 blur-md transition-all duration-500"></span>
              </span>
            </li>
          ))}
          {isAdmin && (
            <li className="group relative cursor-pointer">
              <button
                onClick={() => { window.location.pathname = '/admin'; }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                 Admin
              </button>
            </li>
          )}
        </ul>

        {/* Right: Mobile controls */}
        <div className="flex items-center justify-end gap-4">
          <div
            className="md:hidden text-2xl text-gray-700 cursor-pointer z-50 hover:text-indigo-600 transition duration-300"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`absolute top-full left-0 w-full md:hidden overflow-hidden transition-all duration-500
            ${open ? "max-h-96 py-4 opacity-100" : "max-h-0 opacity-0"} bg-white/90 backdrop-blur-md rounded-b-3xl shadow-xl`}
        >
          <ul className="flex flex-col gap-3 text-gray-700 font-semibold text-lg px-6">
            {navItems.map((item) => (
              <li
                key={item}
                className="text-center py-3 hover:bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl transition-all duration-300 shadow-sm"
              >
                <span
                  className="cursor-pointer hover:text-blue-600 transition-all duration-300"
                  onClick={() => handleScrollTo(item.toLowerCase())}
                >
                  {item}
                </span>
              </li>
            ))}
            {/* Admin Button Mobile */}
            {isAdmin && (
              <li className="text-center py-3">
                <button
                  onClick={() => {
                    window.location.pathname = '/admin';
                    setOpen(false);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ⚙️ Admin
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Admin Dashboard route handled by App.jsx (navigate to /admin) */}
    </nav>
  );
}
