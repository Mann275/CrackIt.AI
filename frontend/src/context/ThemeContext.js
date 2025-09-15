import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

// Theme colors configuration with improved contrast and hierarchical surfaces
const themeColors = {
  light: {
    background: '#F8FAFC',  // Slightly off-white background
    text: '#111827',        // Dark gray text
    textSecondary: '#4B5563', // Secondary text color
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#6366F1',
    surface: '#FFFFFF',     // Pure white surface
    surfaceHover: '#F1F5F9',
    surfaceActive: '#E2E8F0',
    border: '#E2E8F0',
    navbarBg: '#FFFFFF',
    sidebarBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardHover: '#F8FAFC',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  dark: {
    background: '#0F172A',  // Dark blue-gray background
    text: '#F8FAFC',        // Very light gray text
    textSecondary: '#CBD5E1', // Secondary text color
    primary: '#6366F1',
    secondary: '#34D399',
    accent: '#818CF8',
    surface: '#1E293B',     // Slightly lighter than background
    surfaceHover: '#334155',
    surfaceActive: '#475569',
    border: '#334155',
    navbarBg: '#1E293B',
    sidebarBg: '#1E293B',
    cardBg: '#1E293B',
    cardHover: '#334155',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  }
};

export const ThemeProvider = ({ children }) => {
  // Initialize darkMode from localStorage, defaulting to true if not set
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  // Store current theme colors
  const [colors, setColors] = useState(darkMode ? themeColors.dark : themeColors.light);

  // Optimized theme toggle with instant switching
  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      // Update localStorage immediately
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      // Toggle class immediately for instant switch
      document.documentElement.classList.toggle('dark');
      return newMode;
    });
  };
  
  // Initialize theme variables on first load
  useEffect(() => {
    // Apply dark mode by default if not already set
    if (localStorage.getItem('darkMode') === null) {
      localStorage.setItem('darkMode', JSON.stringify(true));
    }

    // Setup theme transition once
    const root = document.documentElement;
    root.style.setProperty('--theme-transition', 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease');
    
    // Add transition to specific properties only
    document.body.style.transition = 'var(--theme-transition)';
  }, []);

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;
    const currentColors = darkMode ? themeColors.dark : themeColors.light;
    
    // Update theme class first
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Batch CSS updates in a single frame
    requestAnimationFrame(() => {
      // Set core theme colors
      document.body.style.backgroundColor = currentColors.background;
      document.body.style.color = currentColors.text;

      // Update CSS variables efficiently
      Object.entries(currentColors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    });

    // Update state colors
    setColors(currentColors);
  }, [darkMode]);

  // Return children directly without wrapper to prevent re-rendering
  const ThemedChildren = ({ children }) => children;

  // Return provider with darkMode state, colors and toggleTheme function
  return (
    <ThemeContext.Provider value={{ darkMode, colors, toggleTheme }}>
      <ThemedChildren>{children}</ThemedChildren>
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
