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
      className={`rounded-xl shadow-sm ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } p-6`}
    >
      <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            className={`flex items-center justify-between p-3 rounded-lg ${
              isDarkMode 
                ? task.completed ? 'bg-gray-700/50' : 'bg-gray-700'
                : task.completed ? 'bg-gray-50' : 'bg-gray-100'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleTask(task.id)}
                className={`p-1 rounded-full ${
                  task.completed
                    ? 'text-green-500'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors`}
              >
                <CheckCircleIcon className={`h-6 w-6 ${
                  task.completed ? 'fill-current' : ''
                }`} />
              </button>
              <div>
                <p className={`font-medium ${
                  task.completed && (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                }`}>
                  {task.title}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.category}
                </p>
              </div>
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
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