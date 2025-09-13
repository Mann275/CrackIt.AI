import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaFilter, FaSearch, FaCode, FaDatabase, FaLaptopCode, FaCogs, FaCodeBranch } from 'react-icons/fa';

const MockTests = () => {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Mock Tests</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <select
                name="topic"
                value={filters.topic}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Topics</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No tests found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div key={test._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  {getTopicIcon(test.topic)}
                  <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {test.topic}
                  </span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    test.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {test.difficulty}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{test.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{test.questions.length} Questions</span>
                  <span>{test.duration} Minutes</span>
                  <span>{test.attempts || 0} Attempts</span>
                </div>
                
                <Link 
                  to={`/tests/${test._id}`}
                  className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Take Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create mock test button (for admin users) */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/create-test"
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default MockTests;
