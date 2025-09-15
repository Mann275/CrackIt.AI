import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  TrophyIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
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
  hover: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const StatsOverview = ({ stats }) => {
  const { darkMode } = useTheme();

  const statCards = [
    {
      icon: TrophyIcon,
      title: "Practice Tests",
      value: stats?.practiceTests || 0,
      label: "tests completed",
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-400"
    },
    {
      icon: ClockIcon,
      title: "Study Time",
      value: stats?.studyHours || 0,
      label: "hours this week",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-400"
    },
    {
      icon: FireIcon,
      title: "Current Streak",
      value: stats?.streak || 0,
      label: "days in a row",
      gradientFrom: "from-orange-500",
      gradientTo: "to-amber-400"
    },
    {
      icon: SparklesIcon,
      title: "Skill Points",
      value: stats?.skillPoints || 0,
      label: "points earned",
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          custom={index}
          variants={statVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          className={`p-6 rounded-2xl shadow-lg ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700/50' 
              : 'bg-white/50 backdrop-blur-sm border border-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              variants={iconVariants}
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} shadow-lg`}
              style={{
                boxShadow: `0 8px 24px -12px var(--tw-gradient-from)`
              }}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-slate-50 text-shadow' : 'text-slate-800'
                }`}>
                  {stat.value}
                </h3>
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  {stat.label}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;