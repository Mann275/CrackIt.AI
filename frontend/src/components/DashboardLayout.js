import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-[240px] min-h-screen">
        {/* Top Navigation Bar */}
        <header className={`h-16 px-6 flex items-center justify-between fixed top-0 right-0 left-[240px] z-20 ${
          isDarkMode ? 'bg-gray-900 border-gray-700/20' : 'bg-white border-gray-200'
        } border-b`}>
          {/* Welcome Message */}
          <h1 className="text-xl font-semibold">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors relative`}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center space-x-3 p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                invisible group-hover:visible transition-all duration-100 opacity-0 group-hover:opacity-100`}
              >
                <a
                  href="/profile"
                  className={`block px-4 py-2 text-sm ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Profile Settings
                </a>
                <button
                  onClick={logout}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pt-16 min-h-screen"
        >
          <div className="p-6">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;