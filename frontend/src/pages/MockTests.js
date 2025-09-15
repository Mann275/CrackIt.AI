import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFilter, FaSearch, FaCode, FaDatabase, FaLaptopCode, FaCogs, FaCodeBranch } from 'react-icons/fa';

const MockTests = () => {
  const { colors } = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    topic: '',
    difficulty: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tests');
        setTests(response.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  const clearFilters = () => {
    setFilters({
      topic: '',
      difficulty: '',
      search: ''
    });
  };
  
  // Filter tests based on selected filters
  const filteredTests = tests.filter(test => {
    return (
      (filters.topic === '' || test.topic === filters.topic) &&
      (filters.difficulty === '' || test.difficulty === filters.difficulty) &&
      (filters.search === '' || 
        test.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        test.description.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });
  
  // Get unique topics for filter dropdown
  const topics = [...new Set(tests.map(test => test.topic))];
  
  // Get icon based on topic
  const getTopicIcon = (topic) => {
    switch(topic.toLowerCase()) {
      case 'algorithms':
        return <FaCode className="text-blue-500" />;
      case 'data structures':
        return <FaDatabase className="text-green-500" />;
      case 'web development':
        return <FaLaptopCode className="text-purple-500" />;
      case 'system design':
        return <FaCogs className="text-orange-500" />;
      case 'version control':
        return <FaCodeBranch className="text-gray-500" />;
      default:
        return <FaCode className="text-blue-500" />;
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
        style={{ color: colors.text }}
      >
        <BackButton />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-4 md:mb-0"
          style={{ color: colors.text }}
        >
          Mock Tests
        </motion.h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full md:w-64"
          >
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.text }} />
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }}
          >
            <FaFilter />
            <span>Filters</span>
          </motion.button>
        </div>
      </div>
      
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg shadow-md p-4 mb-8"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Topic</label>
              <select
                name="topic"
                value={filters.topic}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="">All Topics</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Difficulty</label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: colors.surface, color: colors.text }}
              >
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      
      {filteredTests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg shadow-md p-6 text-center"
          style={{ backgroundColor: colors.cardBg }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No tests found</h2>
          <p style={{ color: colors.text }}>
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTests.map((test) => (
            <motion.div
              key={test._id}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg shadow-md overflow-hidden"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.border
              }}
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  {getTopicIcon(test.topic)}
                  <span className="ml-2 text-sm font-medium" style={{ color: colors.text }}>
                    {test.topic}
                  </span>
                  <span className="ml-auto px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: test.difficulty === 'easy' ? colors.success + '20' :
                        test.difficulty === 'medium' ? colors.warning + '20' : colors.error + '20',
                      color: test.difficulty === 'easy' ? colors.success :
                        test.difficulty === 'medium' ? colors.warning : colors.error
                    }}
                  >
                    {test.difficulty}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>{test.title}</h2>
                <p className="mb-4 line-clamp-2" style={{ color: colors.text }}>{test.description}</p>
                
                <div className="flex justify-between items-center text-sm mb-4" style={{ color: colors.text }}>
                  <span>{test.questions.length} Questions</span>
                  <span>{test.duration} Minutes</span>
                  <span>{test.attempts || 0} Attempts</span>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link 
                    to={`/tests/${test._id}`}
                    className="block w-full text-center py-2 rounded-md"
                    style={{ backgroundColor: colors.primary, color: colors.text }}
                  >
                    Take Test
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Create mock test button (for admin users) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            to="/create-test"
            className="p-4 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={colors.text}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MockTests;
