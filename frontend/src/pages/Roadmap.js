import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl text-red-500">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl">No roadmap found</h2>
        <p className="text-gray-600 mb-4">Let's create a personalized learning roadmap for you!</p>
        <button
          onClick={() => navigate('/skill-survey')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Take Skill Survey
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Overview and Stats */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Readiness Score</p>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {roadmap.overview.readinessScore}%
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Topics Completed</p>
                <div className="text-lg font-semibold">
                  {roadmap.progress.completedTopics.length} / {roadmap.topics.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Focus Areas</h2>
            <ul className="space-y-2">
              {roadmap.overview.focusAreas.map((area, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">Areas to Improve</h2>
            <ul className="space-y-2">
              {roadmap.overview.weakAreas.map((area, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Topics and Weekly Plan */}
        <div className="md:col-span-9 space-y-6">
          {/* Topics Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Learning Path</h2>
            <div className="space-y-6">
              {roadmap.topics.map((topic) => (
                <div key={topic.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{topic.title}</h3>
                    <span className="px-3 py-1 text-sm rounded-full" style={{
                      backgroundColor: topic.difficulty === 'beginner' ? '#e0f2fe' :
                        topic.difficulty === 'intermediate' ? '#fef3c7' : '#fee2e2',
                      color: topic.difficulty === 'beginner' ? '#0369a1' :
                        topic.difficulty === 'intermediate' ? '#92400e' : '#991b1b'
                    }}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{subtopic.title}</h4>
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            subtopic.status === 'completed' ? 'bg-green-100 text-green-600' :
                            subtopic.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {subtopic.status === 'completed' ? '✓' :
                             subtopic.status === 'in-progress' ? '⟳' : '○'}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{subtopic.description}</p>
                        {subtopic.resources.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-500 mb-2">Resources:</p>
                            <ul className="space-y-1">
                              {subtopic.resources.map((resource, idx) => (
                                <li key={idx}>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <span className="mr-1">
                                      {resource.type === 'video' ? '📹' :
                                       resource.type === 'article' ? '📄' :
                                       resource.type === 'tutorial' ? '📚' :
                                       resource.type === 'practice' ? '⚡' : '📖'}
                                    </span>
                                    {resource.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Plan */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">12-Week Learning Plan</h2>
            <div className="space-y-6">
              {roadmap.weeklyPlan.map((week) => (
                <div key={week.week} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Week {week.week}</h3>
                    <span className="text-sm text-gray-500">{week.estimatedHours}hrs/week</span>
                  </div>
                  <p className="text-blue-600 font-medium mb-3">{week.theme}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Goals:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {week.goals.map((goal, idx) => (
                          <li key={idx} className="text-gray-600">{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Focus Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {week.topicsToFocus.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Roadmap;