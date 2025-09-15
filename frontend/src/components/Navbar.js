import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoon, FiSun, FiX, FiMenu } from 'react-icons/fi';
import Logo from './Logo';

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isExpanded } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  // Close user menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('#user-menu-button')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);
  
  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';

  return (
    <nav 
      style={{
        right: 0,
        left: isExpanded ? '240px' : '80px',
      }}
      className={`fixed top-0 h-16 border-b z-20 transition-all duration-300 ease-in-out ${
      darkMode 
        ? 'bg-slate-800/95 border-slate-700 backdrop-blur-sm' 
        : 'bg-white/95 border-slate-200 backdrop-blur-sm'
    } px-4`}>
      <div className="flex h-full justify-between items-center max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className={`text-lg font-semibold ${
            darkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            {location.pathname === '/' ? 'Home' :
             location.pathname === '/features' ? 'Features' :
             location.pathname === '/dashboard' ? 'Dashboard' :
             location.pathname === '/roadmap' ? 'Roadmap' :
             location.pathname === '/checklist' ? 'Checklist' :
             location.pathname === '/chat' ? 'Chatrooms' :
             location.pathname === '/settings' ? 'Settings' : ''}
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <ul className={`flex items-center gap-4 font-medium ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <li>
              <Link to="/" className={`py-2 px-3 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? darkMode 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'bg-indigo-50 text-indigo-600'
                  : 'hover:text-indigo-500'
              }`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/features" className={`py-2 px-3 rounded-lg transition-colors ${
                location.pathname === '/features'
                  ? darkMode
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'bg-indigo-50 text-indigo-600'
                  : 'hover:text-indigo-500'
              }`}>
                Features
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="flex items-center md:order-2 space-x-3">
          <motion.button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
              darkMode
                ? 'text-indigo-400 hover:bg-slate-700' 
                : 'text-indigo-600 hover:bg-slate-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </motion.button>
          
          {user ? (
            <div className="relative">
              <motion.button 
                type="button" 
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg focus:outline-none transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-slate-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="user-menu-button"
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen ? "true" : "false"}
              >
                <span className={`hidden md:block font-medium ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {user.name}
                </span>
                <img 
                  className="h-8 w-8 rounded-lg shadow-md" 
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name}
                  alt={user?.name} 
                />
              </motion.button>
              
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl overflow-hidden border shadow-lg ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="py-1" role="menu">
                      <Link 
                        to="/dashboard" 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                          darkMode 
                            ? 'text-slate-200 hover:bg-slate-700/50' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/settings" 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                          darkMode 
                            ? 'text-slate-200 hover:bg-slate-700/50' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={logout}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                          darkMode 
                            ? 'text-red-400 hover:bg-slate-700/50' 
                            : 'text-red-600 hover:bg-slate-50'
                        }`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`py-2 px-4 rounded-lg ${
                  darkMode 
                    ? 'text-white hover:text-yellow-400' 
                    : 'text-gray-800 hover:text-blue-700'
                }`}
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className={`py-2 px-4 rounded-lg ${
                  darkMode
                    ? 'text-black bg-yellow-400 hover:bg-yellow-500' 
                    : 'text-black bg-yellow-400 hover:bg-yellow-500'
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
          
          <button
            onClick={toggleMenu}
            type="button"
            className={`inline-flex items-center p-2 text-sm rounded-lg md:hidden ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen ? "true" : "false"}
          >
            <span className="sr-only">Toggle menu</span>
            {menuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`${menuOpen ? 'block' : 'hidden'} justify-between items-center w-full md:hidden`}
          id="mobile-menu"
        >
          <ul className={`flex flex-col mt-4 font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <li>
              <Link 
                to="/" 
                className={`block py-2 px-3 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${location.pathname === '/' ? 'text-yellow-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/features" 
                className={`block py-2 px-3 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${location.pathname === '/features' ? 'text-yellow-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
            </li>
            {user && (
              <>
                <li className="md:hidden">
                  <Link 
                    to="/dashboard" 
                    className={`block py-2 px-3 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link 
                    to="/settings" 
                    className={`block py-2 px-3 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </li>
                <li className="md:hidden">
                  <button 
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 px-3 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
