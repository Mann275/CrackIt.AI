import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  MapIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Roadmap', path: '/roadmap', icon: MapIcon },
    { name: 'Practice Tests', path: '/tests', icon: BeakerIcon },
    { name: 'Checklist', path: '/checklist', icon: ClipboardDocumentIcon },
    { name: 'Chatrooms', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon }
  ];

  const sidebarVariants = {
    expanded: {
      width: '240px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: '80px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      initial="expanded"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      className={`fixed left-0 top-0 h-screen z-30 flex flex-col ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      } shadow-lg`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/20">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <img 
                src="/logo.png" 
                alt="CrackIt.AI" 
                className="h-8 w-8"
              />
              <span className="ml-2 font-semibold text-lg">CrackIt.AI</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-lg ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          } transition-colors`}
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center h-12 px-4 my-1 mx-2 rounded-lg transition-colors ${
                isActive
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600'
                  : isDarkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-current' : 'text-gray-500'}`} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700/20' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <img
            src={user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name}
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;