import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const domains = [
  { value: 'webdev', label: 'Web Development' },
  { value: 'appdev', label: 'App Development' },
  { value: 'dsa', label: 'Data Structures & Algorithms' },
  { value: 'ml', label: 'Machine Learning' },
  { value: 'system', label: 'System Design' }
];

const availableSkills = {
  webdev: ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'MongoDB', 'SQL', 'TypeScript', 'Next.js', 'GraphQL'],
  appdev: ['Flutter', 'React Native', 'Android', 'iOS', 'Kotlin', 'Swift', 'Firebase'],
  dsa: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Recursion'],
  ml: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Deep Learning', 'NLP'],
  system: ['Distributed Systems', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'System Architecture']
};

const RoadmapSurvey = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    domain: '',
    skills: [],
    skillLevels: {},
    targetCompany: '',
    expectedLPA: ''
  });

  const handleDomainChange = (e) => {
    const domain = e.target.value;
    setFormData({
      ...formData,
      domain,
      skills: [], // Reset skills when domain changes
      skillLevels: {} // Reset skill levels
    });
  };

  const handleSkillChange = (skill) => {
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];

    const newSkillLevels = { ...formData.skillLevels };
    if (!newSkills.includes(skill)) {
      delete newSkillLevels[skill];
    } else if (!newSkillLevels[skill]) {
      newSkillLevels[skill] = 50; // Default confidence level
    }

    setFormData({
      ...formData,
      skills: newSkills,
      skillLevels: newSkillLevels
    });
  };

  const handleSkillLevelChange = (skill, level) => {
    setFormData({
      ...formData,
      skillLevels: {
        ...formData.skillLevels,
        [skill]: parseInt(level)
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.domain) {
      toast.error('Please select a domain');
      return;
    }
    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    if (!formData.targetCompany) {
      toast.error('Please enter a target company');
      return;
    }
    if (!formData.expectedLPA || formData.expectedLPA < 0) {
      toast.error('Please enter a valid expected LPA');
      return;
    }

    // Transform data for API
    const submitData = {
      domain: formData.domain,
      currentSkills: formData.skills.map(skill => ({
        name: skill,
        confidenceLevel: formData.skillLevels[skill]
      })),
      targetCompany: formData.targetCompany,
      expectedLPA: parseFloat(formData.expectedLPA)
    };

    onSubmit(submitData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Create Your Learning Roadmap</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Your Domain
          </label>
          <select
            value={formData.domain}
            onChange={handleDomainChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Choose a domain</option>
            {domains.map(domain => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Selection */}
        {formData.domain && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Your Current Skills
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableSkills[formData.domain].map(skill => (
                <motion.div
                  key={skill}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/50 border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      className="form-checkbox h-5 w-5 text-indigo-500 rounded border-gray-500 focus:ring-indigo-500"
                    />
                    <span className="text-white">{skill}</span>
                  </label>
                  
                  {/* Confidence Level Slider */}
                  {formData.skills.includes(skill) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 px-3"
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.skillLevels[skill] || 50}
                        onChange={(e) => handleSkillLevelChange(skill, e.target.value)}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-400 text-center mt-1">
                        Confidence: {formData.skillLevels[skill] || 50}%
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Target Company */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Company
          </label>
          <input
            type="text"
            value={formData.targetCompany}
            onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Google, Microsoft, Amazon"
            required
          />
        </div>

        {/* Expected LPA */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expected Package (LPA)
          </label>
          <input
            type="number"
            value={formData.expectedLPA}
            onChange={(e) => setFormData({ ...formData, expectedLPA: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter expected LPA"
            min="0"
            step="0.1"
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Roadmap...
              </div>
            ) : (
              'Generate Roadmap'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RoadmapSurvey;