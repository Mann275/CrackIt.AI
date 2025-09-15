import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const progressVariants = {
  initial: { width: 0 },
  animate: (percentage) => ({
    width: `${percentage}%`,
    transition: {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const ProgressCard = ({ title, value, maxValue, icon: Icon, color = 'indigo', onClick }) => {
  const { darkMode } = useTheme();
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`p-6 rounded-2xl ${
        darkMode 
          ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50' 
          : 'bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50/50'
      } shadow-lg transition-colors duration-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${
            darkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-400 shadow-lg shadow-${color}-500/25`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className={`overflow-hidden h-2 rounded-full ${
            darkMode ? 'bg-slate-700/50' : 'bg-slate-200/50'
          }`}>
            <motion.div
              custom={percentage}
              variants={progressVariants}
              initial="initial"
              animate="animate"
              className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
            />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-2 text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {percentage.toFixed(0)}% Complete
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCard;