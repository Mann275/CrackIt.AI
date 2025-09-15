import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'blue' }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-6 rounded-xl shadow-sm ${
        isDarkMode
          ? `bg-${color}-900/20 hover:bg-${color}-900/30`
          : `bg-${color}-50 hover:bg-${color}-100`
      } transition-colors text-left group`}
    >
      <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600 w-fit group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      
      <h3 className={`mt-4 font-semibold text-${color}-600`}>{title}</h3>
      
      <p className={`mt-2 text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
    </motion.button>
  );
};

export default QuickActionCard;