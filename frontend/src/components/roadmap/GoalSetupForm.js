import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const GoalSetupForm = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    domain: 'Web Development',
    skillLevel: 'Beginner',
    targetCompanies: '',
    expectedLPA: '',
    currentTechStack: [],
    currentSkills: {
      dsa: 1,
      systemDesign: 1,
      development: 1,
      communication: 1
    }
  });

  const techStackOptions = [
    'JavaScript', 'Python', 'Java', 'C++',
    'React', 'Node.js', 'MongoDB', 'SQL',
    'AWS', 'Docker', 'Machine Learning', 'Data Science'
  ];

  useEffect(() => {
    // Load existing goals if any
    const fetchGoals = async () => {
      try {
        const response = await fetch('/api/goals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setFormData(prev => ({
              ...prev,
              domain: data.domain || prev.domain,
              targetCompanies: data.targetCompany || prev.targetCompanies,
              expectedLPA: data.expectedLPA || prev.expectedLPA,
              currentTechStack: data.currentTechStack || []
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, []);

  const handleTechStackChange = (tech) => {
    setFormData(prev => ({
      ...prev,
      currentTechStack: prev.currentTechStack.includes(tech)
        ? prev.currentTechStack.filter(t => t !== tech)
        : [...prev.currentTechStack, tech]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetCompany: formData.targetCompanies.split(',').map(c => c.trim())[0],
          domain: formData.domain,
          currentTechStack: formData.currentTechStack,
          expectedLPA: parseInt(formData.expectedLPA)
        })
      });

      if (response.ok) {
        setMessage('Goals saved successfully! Redirecting to skill survey...');
        setTimeout(() => {
          navigate('/skill-survey');
        }, 1500);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Error updating goals');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-white mb-6">Customize Your Learning Path</h2>
      
      {/* Domain Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Choose Your Domain
        </label>
        <select
          value={formData.domain}
          onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5"
          required
        >
          <option value="Web Development">Web Development</option>
          <option value="App Development">App Development</option>
          <option value="DSA">DSA</option>
          <option value="Machine Learning">Machine Learning</option>
        </select>
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Current Skill Level
        </label>
        <select
          value={formData.skillLevel}
          onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5"
          required
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Target Companies */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
          Target Company 🎯
        </label>
        <input
          type="text"
          value={formData.targetCompanies}
          onChange={(e) => setFormData(prev => ({ ...prev, targetCompanies: e.target.value }))}
          className="w-full p-3 rounded-lg"
          style={{
            backgroundColor: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
          placeholder="e.g. Google, Microsoft, Amazon"
          required
        />
      </div>

      {/* Current Tech Stack */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
          Current Tech Stack 💻
        </label>
        <div className="flex flex-wrap gap-2">
          {techStackOptions.map(tech => (
            <motion.button
              key={tech}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTechStackChange(tech)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                formData.currentTechStack.includes(tech)
                  ? 'text-white'
                  : ''
              }`}
              style={{
                backgroundColor: formData.currentTechStack.includes(tech)
                  ? colors.primary
                  : colors.surface,
                color: formData.currentTechStack.includes(tech)
                  ? '#fff'
                  : colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              {tech}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Expected LPA */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Expected LPA (in lakhs)
        </label>
        <input
          type="number"
          value={formData.expectedLPA}
          onChange={(e) => setFormData(prev => ({ ...prev, expectedLPA: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5"
          placeholder="e.g. 20"
          required
          min="1"
        />
      </div>

      {/* Skill Level Sliders */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Rate Your Skills</h3>
        
        {Object.entries(formData.currentSkills).map(([skill, value]) => (
          <div key={skill}>
            <label className="block text-sm font-medium text-gray-200 mb-2 capitalize">
              {skill.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                currentSkills: {
                  ...prev.currentSkills,
                  [skill]: parseInt(e.target.value)
                }
              }))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Beginner</span>
              <span>Advanced</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
        style={{
          backgroundColor: colors.primary,
          color: '#fff',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? (
          <>
            <span>Saving Goals...</span>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
          </>
        ) : (
          <>
            <span>Save Goals & Continue</span>
            <span>🎯</span>
          </>
        )}
      </button>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg text-center"
          style={{
            backgroundColor: message.includes('success')
              ? '#4CAF50'
              : '#f44336',
            color: '#fff'
          }}
        >
          {message}
        </motion.div>
      )}
    </motion.form>
  );
};

export default GoalSetupForm;