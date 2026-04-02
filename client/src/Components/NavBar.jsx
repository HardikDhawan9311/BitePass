import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Home, Calendar, Upload, FileText, Menu, X, CalendarDays, User, Ticket, Sun, Moon } from "lucide-react";
import { toast } from "react-hot-toast";
import { removeToken } from "../utils/auth";
import ChangePasswordModal from "./ChangePasswordModal";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    removeToken();
    navigate("/signin");
  };

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Events", path: "/events", icon: CalendarDays }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="border-b bg-white/90 dark:bg-[#0d0b14]/60 border-gray-200 dark:border-white/10 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/home" className="flex-shrink-0 flex items-center gap-3 group">
                <div className="w-9 h-9 bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7F5AF0]/20 group-hover:shadow-[#7F5AF0]/40 transition-all duration-300 group-hover:scale-105">
                  <Ticket className="text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" size={20} />
                </div>
                <span className="text-gray-900 dark:text-white font-black text-2xl tracking-wide hidden sm:block transition-colors">
                  Bite<span className="text-[#C77DFF]">Pass</span>
                </span>
              </Link>
            </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-indigo-100 text-indigo-700 dark:bg-white/20 dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              ))}
              
              <div className="relative flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-sm ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 text-yellow-300"
                      : "bg-white border border-gray-200 hover:bg-gray-50 text-indigo-500 hover:shadow-md hover:scale-105"
                  }`}
                  title="Toggle Theme"
                >
                  {isDark ? <Sun size={14} fill="currentColor" /> : <Moon size={14} fill="currentColor" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] hover:scale-105 transition shadow-sm"
                  >
                    <User size={16} className="text-white" />
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a2e]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50">
                      <button
                        onClick={() => { setShowProfileMenu(false); setPasswordModalOpen(true); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white transition"
                      >
                        <User size={14} />
                        Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isDark ? "bg-white/5 text-yellow-300" : "bg-white border border-gray-200 text-indigo-500 shadow-sm"}`}
            >
              {isDark ? <Sun size={14} fill="currentColor" /> : <Moon size={14} fill="currentColor" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-indigo-100 text-indigo-700 dark:bg-white/20 dark:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => { setIsOpen(false); setPasswordModalOpen(true); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <User size={20} />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      )}
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
