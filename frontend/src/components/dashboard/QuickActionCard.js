import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

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

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const arrowVariants = {
  initial: { x: 0, opacity: 0.5 },
  hover: { 
    x: 4,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'indigo' }) => {
  const { darkMode } = useTheme();

  return (
    <motion.button
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`w-full p-6 rounded-2xl ${
        darkMode
          ? `bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50`
          : `bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50/50`
      } shadow-lg transition-all duration-200 text-left group relative overflow-hidden`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-grow">
          <motion.div
            variants={iconVariants}
            className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-400 shadow-lg shadow-${color}-500/25 w-fit`}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
          
          <h3 className={`mt-4 font-semibold ${
            darkMode 
              ? `text-slate-100 group-hover:text-${color}-400` 
              : `text-slate-800 group-hover:text-${color}-600`
          } transition-colors`}>
            {title}
          </h3>
          
          <p className={`mt-2 text-sm ${
            darkMode 
              ? 'text-slate-400 group-hover:text-slate-300' 
              : 'text-slate-600 group-hover:text-slate-700'
          } transition-colors`}>
            {description}
          </p>
        </div>
        
        <motion.div
          variants={arrowVariants}
          className={`text-${color}-500 transition-all duration-200`}
        >
          <ArrowRightIcon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;