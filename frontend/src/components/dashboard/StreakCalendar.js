import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const StreakCalendar = ({ streak = [] }) => {
  const { isDarkMode } = useTheme();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate last 7 days data
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date,
      day: days[date.getDay()],
      active: streak.includes(date.toISOString().split('T')[0])
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl shadow-md ${
        isDarkMode 
          ? 'bg-slate-800/90 border border-slate-700/50 backdrop-blur-sm' 
          : 'bg-white border border-gray-100'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
        Activity Streak
      </h3>
      <div className="flex justify-between">
        {lastSevenDays.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {day.day}
            </span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`w-8 h-8 rounded-lg mt-2 flex items-center justify-center font-medium ${
                day.active
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300 border border-slate-600/50'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {day.date.getDate()}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StreakCalendar;