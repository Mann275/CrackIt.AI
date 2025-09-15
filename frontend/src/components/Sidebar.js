import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  HomeIcon,
  MapIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { darkMode: isDarkMode } = useTheme();
  const { user } = useAuth();
  const { isExpanded, toggleSidebar } = useSidebar();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Goal Setup', path: '/goal-setup', icon: AcademicCapIcon },
    { name: 'Skill Survey', path: '/skill-survey', icon: QuestionMarkCircleIcon },
    { name: 'Roadmap', path: '/roadmap', icon: MapIcon },
    { name: 'Practice Tests', path: '/practice-tests', icon: BeakerIcon },
    { name: 'Checklist', path: '/checklist', icon: ClipboardDocumentIcon },
    { name: 'Chatrooms', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'QnA Vault', path: '/qna', icon: QuestionMarkCircleIcon },
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
        isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'
      } border-r ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <span className="text-xl font-bold text-indigo-500">CrackIt.AI</span>
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <span className="text-xl font-bold text-indigo-500">C.AI</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
          }`}
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`flex items-center h-12 px-3 my-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-indigo-50 text-indigo-600'
                    : isDarkMode
                    ? 'text-slate-300 hover:bg-slate-700/50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-current' : ''}`} />
                <AnimatePresence mode="wait">
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
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <motion.div
        className={`p-3 mx-2 mb-2 rounded-xl border ${
          isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name}
            alt="Profile"
            className="h-9 w-9 rounded-lg shadow-md"
          />
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-sm truncate">
                  {user?.name}
                </p>
                <p className={`text-xs truncate ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;