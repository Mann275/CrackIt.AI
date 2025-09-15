import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const TaskList = ({ tasks, onToggleTask }) => {
  const { isDarkMode } = useTheme();

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className={`rounded-xl shadow-lg ${
        isDarkMode ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700/50' : 'bg-white'
      } p-6`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-slate-100' : 'text-slate-800'
      }`}>Upcoming Tasks</h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            className={`flex items-center justify-between p-3 rounded-lg ${
              isDarkMode 
                ? task.completed ? 'bg-slate-700/50 border border-slate-600/30' : 'bg-slate-700/80 border border-slate-600/50'
                : task.completed ? 'bg-slate-50' : 'bg-slate-100'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`p-1 rounded-full ${
                  task.completed
                    ? 'text-green-400 hover:text-green-300'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                } transition-colors`}
              >
                <CheckCircleIcon className={`h-6 w-6 ${
                  task.completed ? 'fill-current' : ''
                }`} />
              </button>
              <div>
                <p className={`font-medium ${
                  task.completed 
                    ? isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    : isDarkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {task.title}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {task.category}
                </p>
              </div>
            </div>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {task.dueDate}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TaskList;