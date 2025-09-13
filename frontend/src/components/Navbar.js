import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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
    <nav className={`border-b ${
      darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    } px-4 py-2.5 lg:px-6`}>
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <Link to="/" className="flex items-center">
          <span className={`self-center text-xl font-semibold whitespace-nowrap ${
            darkMode ? 'text-white' : 'text-black'
          }`}>
            CrackIt.AI
          </span>
        </Link>
        
        <div className={`hidden justify-between items-center w-full md:flex md:w-auto md:order-1`} id="desktop-menu">
          <ul className={`flex flex-row font-medium space-x-8 ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            <li>
              <Link to="/" className={`block py-2 px-3 ${
                location.pathname === '/' ? 'text-yellow-400' : ''
              } hover:text-yellow-400`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/catalog" className={`block py-2 px-3 ${
                location.pathname === '/catalog' ? 'text-yellow-400' : ''
              } hover:text-yellow-400`}>
                Catalog
              </Link>
            </li>
            <li>
              <Link to="/about" className={`block py-2 px-3 ${
                location.pathname === '/about' ? 'text-yellow-400' : ''
              } hover:text-yellow-400`}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`block py-2 px-3 ${
                location.pathname === '/contact' ? 'text-yellow-400' : ''
              } hover:text-yellow-400`}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="flex items-center md:order-2 space-x-3">
          <motion.button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg flex items-center justify-center ${
              darkMode
                ? 'text-amber-300 hover:bg-gray-700' 
                : 'text-indigo-600 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.1 }}
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
              <button 
                type="button" 
                className="flex items-center space-x-2 focus:outline-none" 
                id="user-menu-button"
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen ? "true" : "false"}
              >
                <span className={`hidden md:block ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {user.name}
                </span>
                <img 
                  className="h-8 w-8 rounded-full border-2 border-yellow-400" 
                  src="https://placehold.co/200x200/1e40af/ffffff?text=User"
                  alt="User" 
                />
              </button>
              
              {userMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                  darkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
                }`}>
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                    <Link 
                      to="/dashboard" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/settings" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={logout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
            <span className="sr-only">Open main menu</span>
            <svg className={`${menuOpen ? 'hidden' : 'block'} w-6 h-6`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            <svg className={`${menuOpen ? 'block' : 'hidden'} w-6 h-6`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
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
                to="/catalog" 
                className={`block py-2 px-3 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${location.pathname === '/catalog' ? 'text-yellow-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Catalog
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`block py-2 px-3 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${location.pathname === '/about' ? 'text-yellow-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`block py-2 px-3 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${location.pathname === '/contact' ? 'text-yellow-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
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
