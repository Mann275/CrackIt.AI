import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const TestResultCard = ({ result }) => {
  const { isDarkMode } = useTheme();

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-xl shadow-sm ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{result.testName}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {result.date}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          result.improvement > 0 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {result.improvement > 0 ? (
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              +{result.improvement}%
            </div>
          ) : (
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              {result.improvement}%
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Score Display */}
        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Score
            </span>
            <span className={`text-sm font-medium text-${getScoreColor(result.score)}-500`}>
              {result.score}%
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute h-full rounded-full bg-${getScoreColor(result.score)}-500`}
            />
          </div>
        </div>

        {/* AI Feedback Summary */}
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="font-medium mb-2">AI Feedback:</p>
          <p>{result.aiFeedback}</p>
        </div>

        {/* Areas for Improvement */}
        {result.areasToImprove && (
          <div>
            <p className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Areas to Focus:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.areasToImprove.map((area, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TestResultCard;