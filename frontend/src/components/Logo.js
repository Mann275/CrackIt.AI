import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Logo = ({ isCompact = false }) => {
  const { darkMode } = useTheme();
  
  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center ${isCompact ? 'gap-1' : 'gap-2'}`}>
        {/* Logo Icon */}
        <motion.div
          className={`flex items-center justify-center rounded-xl ${
            isCompact ? 'w-8 h-8' : 'w-10 h-10'
          } bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`font-bold ${isCompact ? 'text-lg' : 'text-xl'} text-white`}>
            C
          </span>
        </motion.div>

        {/* Logo Text */}
        <motion.div 
          className={`font-bold ${isCompact ? 'text-xl' : 'text-2xl'} ${
            darkMode ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {isCompact ? (
            <span>AI</span>
          ) : (
            <>
              <span>Crack</span>
              <span className="text-indigo-500">It</span>
              <span className="text-indigo-400">.AI</span>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Logo;