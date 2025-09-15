import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ProgressCard = ({ title, value, maxValue, icon: Icon, color = 'blue', onClick }) => {
  const { isDarkMode } = useTheme();
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-xl shadow-sm ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
      } transition-colors cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="relative pt-1">
          <div className={`overflow-hidden h-2 text-xs flex rounded bg-${color}-100`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500`}
            />
          </div>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}% Complete
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCard;