import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SkillSurvey = () => {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save skills to user profile
      await updateProfile({
        skills: formData,
        hasCompletedSkillSurvey: true
      });
      
      toast.success('Skills saved successfully!');

      // Generate roadmap
      const response = await axios.post('/api/roadmap/generate', {
        userId: user._id,
        skills: formData
      });
      
      if (response.data) {
        toast.success('Roadmap generated successfully!');
        navigate('/roadmap');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save and generate roadmap');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="min-h-screen">
      <BackButton />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Skill Assessment</h1>
            <p className="mt-2 text-lg">Help us understand your current skill level to create a personalized roadmap</p>
          </div>
          
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
                      style={{ backgroundColor: colors.border }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: colors.textSecondary }}>
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
                      style={{ backgroundColor: colors.border }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: colors.textSecondary }}>
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
                      style={{ backgroundColor: colors.border }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: colors.textSecondary }}>
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="px-6 py-2 rounded-md"
                style={{ backgroundColor: colors.surface, color: colors.text }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-md"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.buttonText,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
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