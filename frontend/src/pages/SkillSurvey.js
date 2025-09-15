import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const SkillSurvey = () => {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [surveyData, setSurveyData] = useState({
    dsaTopics: [],
    coreSubjects: [],
    developmentExperience: []
  });

  // Skill survey data from backend
  const [formData, setFormData] = useState({
    dsaSkills: {
      arrays: 1,
      linkedLists: 1,
      stacks: 1,
      queues: 1,
      trees: 1,
      graphs: 1,
      dp: 1,
      recursion: 1,
      searching: 1,
      sorting: 1
    },
    coreCSSkills: {
      dbms: 1,
      os: 1,
      cn: 1,
      oops: 1
    },
    devExperience: {
      web: 1,
      app: 1,
      ml: 1,
      cloud: 1
    }
  });

  const handleDsaChange = (skill, value) => {
    setFormData(prevData => ({
      ...prevData,
      dsaSkills: {
        ...prevData.dsaSkills,
        [skill]: parseInt(value)
      }
    }));
  };

  const handleCoreCSChange = (skill, value) => {
    setFormData(prevData => ({
      ...prevData,
      coreCSSkills: {
        ...prevData.coreCSSkills,
        [skill]: parseInt(value)
      }
    }));
  };

  const handleDevExpChange = (skill, value) => {
    setFormData(prevData => ({
      ...prevData,
      devExperience: {
        ...prevData.devExperience,
        [skill]: parseInt(value)
      }
    }));
  };

  const dsaTopics = [
    { id: 'arrays', name: 'Arrays' },
    { id: 'linkedLists', name: 'Linked Lists' },
    { id: 'stacks', name: 'Stacks' },
    { id: 'queues', name: 'Queues' },
    { id: 'trees', name: 'Trees' },
    { id: 'graphs', name: 'Graphs' },
    { id: 'dp', name: 'Dynamic Programming' },
    { id: 'recursion', name: 'Recursion' },
    { id: 'searching', name: 'Searching Algorithms' },
    { id: 'sorting', name: 'Sorting Algorithms' }
  ];
  
  const coreCSTopics = [
    { id: 'dbms', name: 'Database Management Systems' },
    { id: 'os', name: 'Operating Systems' },
    { id: 'cn', name: 'Computer Networks' },
    { id: 'oops', name: 'Object-Oriented Programming' }
  ];
  
  const devTopics = [
    { id: 'web', name: 'Web Development' },
    { id: 'app', name: 'App Development' },
    { id: 'ml', name: 'Machine Learning' },
    { id: 'cloud', name: 'Cloud Computing' }
  ];

  const getSkillLevelText = (level) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Beginner';
    }
  };

  useEffect(() => {
    // Load existing survey data if any
    const fetchSurveyData = async () => {
      try {
        const response = await fetch('/api/survey', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSurveyData(data);
            // Convert survey data to form data format
            const dsaSkills = {};
            const coreCSSkills = {};
            const devExperience = {};

            data.dsaTopics.forEach(topic => {
              dsaSkills[topic.name.toLowerCase().replace(/\s+/g, '')] = Math.ceil(topic.confidenceLevel / 20);
            });

            data.coreSubjects.forEach(subject => {
              coreCSSkills[subject.name.toLowerCase().replace(/\s+/g, '')] = Math.ceil(subject.confidenceLevel / 20);
            });

            data.developmentExperience.forEach(exp => {
              devExperience[exp.name.toLowerCase().replace(/\s+/g, '')] = Math.ceil(exp.confidenceLevel / 20);
            });

            setFormData(prev => ({
              ...prev,
              dsaSkills: { ...prev.dsaSkills, ...dsaSkills },
              coreCSSkills: { ...prev.coreCSSkills, ...coreCSSkills },
              devExperience: { ...prev.devExperience, ...devExperience }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching survey data:', error);
      }
    };

    fetchSurveyData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Convert form data to survey format
      const surveyData = {
        dsaTopics: Object.entries(formData.dsaSkills).map(([key, value]) => ({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          confidenceLevel: value * 20
        })),
        coreSubjects: Object.entries(formData.coreCSSkills).map(([key, value]) => ({
          name: key.toUpperCase(),
          confidenceLevel: value * 20
        })),
        developmentExperience: Object.entries(formData.devExperience).map(([key, value]) => ({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          confidenceLevel: value * 20
        }))
      };

      // Save survey data
      const surveyResponse = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(surveyData)
      });

      if (!surveyResponse.ok) {
        throw new Error('Failed to save survey data');
      }

      // Update user profile
      await updateProfile({
        skills: formData,
        hasCompletedSkillSurvey: true
      });
      
      // Generate roadmap
      const roadmapResponse = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          userId: user._id,
          skills: formData,
          survey: surveyData
        })
      });
      
      if (!roadmapResponse.ok) {
        throw new Error('Failed to generate roadmap');
      }
      
      setMessage('Survey completed! Generating your personalized roadmap...');
      setTimeout(() => {
        navigate('/roadmap');
      }, 1500);
    } catch (err) {
      setMessage('Failed to save your skill assessment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className={`rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Skill Assessment</h1>
            <p className="mt-2 text-lg">Help us understand your current skill level to create a personalized roadmap</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* DSA Skills */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Structures & Algorithms</h2>
              <p className="text-sm mb-4">Rate your knowledge level in the following DSA topics:</p>
              
              <div className="space-y-6">
                {dsaTopics.map(topic => (
                  <div key={topic.id}>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={topic.id} className="text-sm font-medium">{topic.name}</label>
                      <span className="text-sm">
                        {getSkillLevelText(formData.dsaSkills[topic.id])}
                      </span>
                    </div>
                    <input
                      type="range"
                      id={topic.id}
                      name={topic.id}
                      min="1"
                      max="5"
                      value={formData.dsaSkills[topic.id]}
                      onChange={(e) => handleDsaChange(topic.id, e.target.value)}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Core CS Skills */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Core Computer Science</h2>
              <p className="text-sm mb-4">Rate your knowledge level in the following core CS topics:</p>
              
              <div className="space-y-6">
                {coreCSTopics.map(topic => (
                  <div key={topic.id}>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={topic.id} className="text-sm font-medium">{topic.name}</label>
                      <span className="text-sm">
                        {getSkillLevelText(formData.coreCSSkills[topic.id])}
                      </span>
                    </div>
                    <input
                      type="range"
                      id={topic.id}
                      name={topic.id}
                      min="1"
                      max="5"
                      value={formData.coreCSSkills[topic.id]}
                      onChange={(e) => handleCoreCSChange(topic.id, e.target.value)}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Development Experience */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Development Experience</h2>
              <p className="text-sm mb-4">Rate your experience level in the following areas:</p>
              
              <div className="space-y-6">
                {devTopics.map(topic => (
                  <div key={topic.id}>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={`dev-${topic.id}`} className="text-sm font-medium">{topic.name}</label>
                      <span className="text-sm">
                        {getSkillLevelText(formData.devExperience[topic.id])}
                      </span>
                    </div>
                    <input
                      type="range"
                      id={`dev-${topic.id}`}
                      name={`dev-${topic.id}`}
                      min="1"
                      max="5"
                      value={formData.devExperience[topic.id]}
                      onChange={(e) => handleDevExpChange(topic.id, e.target.value)}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed text-white' 
                    : darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Submitting...' : 'Generate My Roadmap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillSurvey;
