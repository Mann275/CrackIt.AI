import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TestPerformance from '../components/TestPerformance';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(user?.targetCompanies?.[0] || '');
  const [chatrooms, setChatrooms] = useState([]);
  const [qnaVault, setQnaVault] = useState([]);

  useEffect(() => {
    // Fetch user's roadmap
    const fetchRoadmap = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/roadmap/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRoadmap(data.roadmap);
        } else {
          throw new Error('Failed to load roadmap');
        }
      } catch (err) {
        setError('Failed to load roadmap. Please try again later.');
        console.error(err);
      }
    };
    
    // Fetch test results summary
    const fetchTestResults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tests/results', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTestResults(data.results);
        } else {
          throw new Error('Failed to load test results');
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Fetch available chatrooms
    const fetchChatrooms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chatrooms', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChatrooms(data.chatrooms);
        } else {
          throw new Error('Failed to load chatrooms');
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Fetch QnA vault for the selected company
    const fetchQnA = async () => {
      if (!selectedCompany) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/qna/${selectedCompany}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setQnaVault(data.questions);
        } else {
          throw new Error('Failed to load QnA vault');
        }
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([
      fetchRoadmap(),
      fetchTestResults(),
      fetchChatrooms(),
      fetchQnA()
    ])
    .then(() => setLoading(false))
    .catch(() => setLoading(false));
  }, [selectedCompany]);

  const calculateRoadmapProgress = () => {
    if (!roadmap?.checklist) return 0;
    
    const completedItems = roadmap.checklist.filter(item => item.completed).length;
    return (completedItems / roadmap.checklist.length) * 100;
  };
  
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };
  
  const handleToggleChecklistItem = async (itemId) => {
    try {
      const updatedChecklist = roadmap.checklist.map(item => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      
      setRoadmap({
        ...roadmap,
        checklist: updatedChecklist
      });
      
      // Update in backend
      await fetch(`http://localhost:5000/api/roadmap/checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          completed: !roadmap.checklist.find(item => item.id === itemId).completed
        })
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  const refreshQnAVault = async () => {
    if (!selectedCompany) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/qna/fetch/${selectedCompany}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQnaVault(data.questions);
      } else {
        throw new Error('Failed to fetch QnA');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Here's your personalized dashboard
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link 
              to="/mock-tests" 
              className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              Take a Practice Test
            </Link>
            <Link 
              to="/settings" 
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Settings"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Roadmap Progress */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-2 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Roadmap Progress
            </h2>
            
            {roadmap ? (
              <>
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(calculateRoadmapProgress())}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateRoadmapProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Checklist */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">Study Checklist</h3>
                  <div className={`p-4 rounded-lg max-h-64 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ul className="space-y-3">
                      {roadmap.checklist.map(item => (
                        <li key={item.id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`checklist-${item.id}`}
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklistItem(item.id)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <label 
                            htmlFor={`checklist-${item.id}`} 
                            className={`ml-3 text-sm ${item.completed ? 'line-through opacity-60' : ''}`}
                          >
                            {item.task}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Weekly Plan */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Weekly Study Plan</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roadmap.weeklyPlan && roadmap.weeklyPlan.map((plan, index) => (
                        <div key={index} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                          <p className="font-medium">{plan.day}</p>
                          <p className="text-sm mt-1">{plan.task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <p>No roadmap available. Please complete the skill survey.</p>
                <Link 
                  to="/skill-survey" 
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Take Skill Survey
                </Link>
              </div>
            )}
          </div>
          
          {/* Test Performance Component */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Test Performance
            </h2>
            
            <div className="max-h-96 overflow-y-auto">
              <TestPerformance />
            </div>
            
            <Link 
              to="/tests" 
              className="text-blue-600 hover:underline text-sm flex items-center mt-4"
            >
              Take a Practice Test
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Chatrooms */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Company Chatrooms
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {chatrooms.length > 0 ? (
                chatrooms.map(room => (
                  <Link 
                    key={room._id} 
                    to={`/chatroom/${room.company}`}
                    className={`block p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{room.company}</h4>
                        <p className="text-xs mt-1">{room.activeUsers} users online</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {room.unreadMessages} new
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center py-6">No chatrooms available</p>
              )}
            </div>
            
            <Link 
              to="/chatrooms" 
              className="text-blue-600 hover:underline text-sm flex items-center mt-4"
            >
              View all chatrooms
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* QnA Vault */}
          <div className={`col-span-1 lg:col-span-3 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Company Q&A Vault
              </h2>
              
              <div className="flex items-center">
                <select 
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  className={`mr-2 px-3 py-2 rounded-md ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {user?.targetCompanies?.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                
                <button
                  onClick={refreshQnAVault}
                  className={`p-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            
            {qnaVault.length > 0 ? (
              <div className={`p-4 rounded-lg max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="space-y-4">
                  {qnaVault.map((qna, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                    >
                      <h4 className="font-medium mb-2">Q: {qna.question}</h4>
                      <p className="text-sm">A: {qna.answer}</p>
                      <div className="mt-2 flex items-center text-xs">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Source: {qna.source}
                        </span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded ${
                          darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {qna.topic}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Fetching interview questions...</span>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">No interview questions available for {selectedCompany}</p>
                    <button
                      onClick={refreshQnAVault}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Fetch Questions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
