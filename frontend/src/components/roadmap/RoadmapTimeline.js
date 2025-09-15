import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const RoadmapTimeline = ({ topics, onTopicComplete }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // Priority color mapping
  const priorityColors = {
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500'
  };

  // Category icon mapping
  const categoryIcons = {
    'DSA': '🔍',
    'Core CS': '💻',
    'Development': '⚙️',
    'System Design': '🏗️',
    'Soft Skills': '🗣️'
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

      {/* Topics */}
      <div className="space-y-8">
        {topics.map((topic, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`relative pl-20 ${topic.completed ? 'opacity-75' : ''}`}
          >
            {/* Timeline dot */}
            <div className="absolute left-7 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600" />

            {/* Content card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{categoryIcons[topic.category]}</span>
                    <h3 className="text-lg font-semibold text-white">{topic.name}</h3>
                    <span className={`text-sm font-medium ${priorityColors[topic.priority]}`}>
                      {topic.priority} Priority
                    </span>
                  </div>

                  <div className="mt-2 flex items-center text-gray-400 text-sm space-x-4">
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {topic.timeEstimate} hours
                    </span>
                    <span className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      {topic.readiness}% complete
                    </span>
                  </div>

                  {/* Resources section */}
                  {topic.resources && topic.resources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Learning Resources:</h4>
                      <div className="space-y-2">
                        {topic.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {resource.title} ({resource.type})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion toggle */}
                <button
                  onClick={() => onTopicComplete(topic._id, !topic.completed)}
                  className={`ml-4 p-2 rounded-lg transition-colors ${
                    topic.completed
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {topic.completed ? (
                    <CheckCircleSolidIcon className="w-6 h-6" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RoadmapTimeline;