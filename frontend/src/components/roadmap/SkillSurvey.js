import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../DashboardLayout';

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion',
  'Sorting', 'Searching', 'Hashing', 'Greedy'
];
const CORE_SUBJECTS = [
  'Operating Systems', 'Database Management',
  'Computer Networks', 'System Design',
  'Object-Oriented Programming', 'Computer Architecture'
];
const DEV_AREAS = [
  'Web Development', 'Mobile Development',
  'Machine Learning', 'DevOps',
  'Cloud Computing', 'Data Science',
  'Backend Development', 'Frontend Development'
];

const SkillSurvey = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    dsaTopics: DSA_TOPICS.map(name => ({ name, confidenceLevel: 0 })),
    coreSubjects: CORE_SUBJECTS.map(name => ({ name, confidenceLevel: 0 })),
    developmentExperience: DEV_AREAS.map(area => ({ area, confidenceLevel: 0, yearsOfExperience: 0 }))
  });

  useEffect(() => {
    // Load existing survey if any
    const fetchSurvey = async () => {
      try {
        const response = await fetch('/api/survey', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) setFormData(data);
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
      }
    };
    fetchSurvey();
  }, []);

  const handleSlider = (section, idx, value, field = 'confidenceLevel') => {
    setFormData(prev => {
      const updated = [...prev[section]];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setMessage('Survey saved! Redirecting to roadmap...');
        setTimeout(() => navigate('/roadmap'), 1500);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Error saving survey');
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.form onSubmit={handleSubmit} className="space-y-8 p-6 rounded-xl shadow-lg" style={{ backgroundColor: colors.cardBg }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Skill Survey</h1>
          <p className="mb-6" style={{ color: colors.textSecondary }}>Rate your confidence in each area (0-100%)</p>

          {/* DSA Topics */}
          <div>
            <h2 className="font-semibold mb-2" style={{ color: colors.text }}>DSA Topics</h2>
            {formData.dsaTopics.map((topic, idx) => (
              <div key={topic.name} className="mb-2">
                <label className="block text-sm mb-1" style={{ color: colors.text }}>{topic.name}</label>
                <input type="range" min="0" max="100" value={topic.confidenceLevel} onChange={e => handleSlider('dsaTopics', idx, parseInt(e.target.value))} className="w-full" />
                <span className="text-xs" style={{ color: colors.textSecondary }}>{topic.confidenceLevel}%</span>
              </div>
            ))}
          </div>

          {/* Core Subjects */}
          <div>
            <h2 className="font-semibold mb-2 mt-6" style={{ color: colors.text }}>Core Subjects</h2>
            {formData.coreSubjects.map((subject, idx) => (
              <div key={subject.name} className="mb-2">
                <label className="block text-sm mb-1" style={{ color: colors.text }}>{subject.name}</label>
                <input type="range" min="0" max="100" value={subject.confidenceLevel} onChange={e => handleSlider('coreSubjects', idx, parseInt(e.target.value))} className="w-full" />
                <span className="text-xs" style={{ color: colors.textSecondary }}>{subject.confidenceLevel}%</span>
              </div>
            ))}
          </div>

          {/* Development Experience */}
          <div>
            <h2 className="font-semibold mb-2 mt-6" style={{ color: colors.text }}>Development Experience</h2>
            {formData.developmentExperience.map((dev, idx) => (
              <div key={dev.area} className="mb-2">
                <label className="block text-sm mb-1" style={{ color: colors.text }}>{dev.area}</label>
                <input type="range" min="0" max="100" value={dev.confidenceLevel} onChange={e => handleSlider('developmentExperience', idx, parseInt(e.target.value))} className="w-full" />
                <span className="text-xs mr-2" style={{ color: colors.textSecondary }}>{dev.confidenceLevel}%</span>
                <input type="number" min="0" max="20" value={dev.yearsOfExperience} onChange={e => handleSlider('developmentExperience', idx, parseInt(e.target.value), 'yearsOfExperience')} className="w-16 ml-2 p-1 rounded" style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }} placeholder="Years" />
                <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>years</span>
              </div>
            ))}
          </div>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full p-4 rounded-lg font-medium flex items-center justify-center gap-2" style={{ backgroundColor: colors.primary, color: '#fff', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><span>Saving...</span><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span></> : <>Save & Continue <span>📝</span></>}
          </motion.button>
          {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg text-center" style={{ backgroundColor: message.includes('saved') ? '#4CAF50' : '#f44336', color: '#fff' }}>{message}</motion.div>}
        </motion.form>
      </motion.div>
    </DashboardLayout>
  );
};

export default SkillSurvey;
