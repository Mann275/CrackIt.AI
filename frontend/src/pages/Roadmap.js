import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { motion } from 'framer-motion';

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get('/api/roadmap');
        setRoadmap(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError('Failed to load your learning roadmap');
        setLoading(false);
      }
    };

    if (user) {
      fetchRoadmap();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
            style={{ borderColor: colors.primary }}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
          <h2 className="text-xl" style={{ color: colors.error }}>{error}</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: colors.primary, color: colors.text }}
          >
            Try Again
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  if (!roadmap) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
          <h2 className="text-xl" style={{ color: colors.text }}>No roadmap found</h2>
          <p style={{ color: colors.text }}>Let's create a personalized learning roadmap for you!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/skill-survey')}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.text }}
          >
            Take Skill Survey
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Overview and Stats */}
        <div className="md:col-span-3 space-y-6">
                <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Your Progress</h2>
              <div className="space-y-4">
                <div>
                  <p style={{ color: colors.text }}>Readiness Score</p>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                      {roadmap.overview.readinessScore}%
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ color: colors.text }}>Topics Completed</p>
                  <div className="text-lg font-semibold" style={{ color: colors.text }}>
                    {roadmap.progress.completedTopics.length} / {roadmap.topics.length}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Focus Areas</h2>
              <ul className="space-y-2">
                {roadmap.overview.focusAreas.map((area, index) => (
                  <li key={index} className="flex items-center" style={{ color: colors.text }}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }}></span>
                    {area}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.warning }}>Areas to Improve</h2>
              <ul className="space-y-2">
                {roadmap.overview.weakAreas.map((area, index) => (
                  <li key={index} className="flex items-center" style={{ color: colors.text }}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.warning }}></span>
                    {area}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

        {/* Right Column - Topics and Weekly Plan */}
        <div className="md:col-span-9 space-y-6">
          {/* Topics Progress */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="rounded-xl shadow-md p-6"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          >
            <h2 className="text-xl font-semibold mb-6" style={{ color: colors.text }}>Learning Path</h2>
            <div className="space-y-6">
              {roadmap.topics.map((topic) => (
                <div key={topic.id} className="border-b pb-6 last:border-0 last:pb-0" 
                  style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text }}>{topic.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: topic.difficulty === 'beginner' ? colors.success + '20' :
                          topic.difficulty === 'intermediate' ? colors.warning + '20' : colors.error + '20',
                        color: topic.difficulty === 'beginner' ? colors.success :
                          topic.difficulty === 'intermediate' ? colors.warning : colors.error
                      }}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <p style={{ color: colors.text }}>{topic.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {topic.subtopics.map((subtopic) => (
                      <motion.div
                        key={subtopic.id}
                        whileHover={{ scale: 1.02 }}
                        className="border rounded-lg p-4"
                        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium" style={{ color: colors.text }}>{subtopic.title}</h4>
                          <div className="h-6 w-6 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: subtopic.status === 'completed' ? colors.success + '20' :
                                subtopic.status === 'in-progress' ? colors.primary + '20' : colors.surface,
                              color: subtopic.status === 'completed' ? colors.success :
                                subtopic.status === 'in-progress' ? colors.primary : colors.text
                            }}>
                            {subtopic.status === 'completed' ? '✓' :
                             subtopic.status === 'in-progress' ? '⟳' : '○'}
                          </div>
                        </div>
                        <p className="text-sm" style={{ color: colors.text }}>{subtopic.description}</p>
                        {subtopic.resources.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>Resources:</p>
                            <ul className="space-y-1">
                              {subtopic.resources.map((resource, idx) => (
                                <motion.li key={idx} whileHover={{ scale: 1.02 }}>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm flex items-center"
                                    style={{ color: colors.primary }}
                                  >
                                    <span className="mr-1">
                                      {resource.type === 'video' ? '📹' :
                                       resource.type === 'article' ? '📄' :
                                       resource.type === 'tutorial' ? '📚' :
                                       resource.type === 'practice' ? '⚡' : '📖'}
                                    </span>
                                    {resource.title}
                                  </a>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Plan */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="rounded-xl shadow-md p-6"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          >
            <h2 className="text-xl font-semibold mb-6" style={{ color: colors.text }}>12-Week Learning Plan</h2>
            <div className="space-y-6">
              {roadmap.weeklyPlan.map((week) => (
                <div key={week.week} className="border-b pb-6 last:border-0 last:pb-0" 
                  style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Week {week.week}</h3>
                    <span style={{ color: colors.text }}>{week.estimatedHours}hrs/week</span>
                  </div>
                  <p className="font-medium mb-3" style={{ color: colors.primary }}>{week.theme}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>Goals:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {week.goals.map((goal, idx) => (
                          <li key={idx} style={{ color: colors.text }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>Focus Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {week.topicsToFocus.map((topic, idx) => (
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            key={idx}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{
                              backgroundColor: colors.primary + '20',
                              color: colors.primary
                            }}
                          >
                            {topic}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </DashboardLayout>
  );
};

export default Roadmap;