import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPerformance = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/test-results');
        setTestResults(response.data);
        
        // Process data for charts
        processPerformanceData(response.data);
      } catch (err) {
        setError('Error fetching test results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestResults();
  }, []);
  
  const processPerformanceData = (results) => {
    if (!results || results.length === 0) return;
    
    // Group results by topic
    const topicScores = {};
    results.forEach(result => {
      const topic = result.test.topic;
      
      if (!topicScores[topic]) {
        topicScores[topic] = {
          scores: [],
          average: 0
        };
      }
      
      topicScores[topic].scores.push(result.score);
    });
    
    // Calculate averages
    Object.keys(topicScores).forEach(topic => {
      const scores = topicScores[topic].scores;
      const sum = scores.reduce((acc, score) => acc + score, 0);
      topicScores[topic].average = Math.round(sum / scores.length);
    });
    
    // Recent test trends (last 5 tests)
    const recentTests = [...results]
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .reverse();
    
    const trendData = {
      labels: recentTests.map((result, index) => `Test ${index + 1}`),
      datasets: [
        {
          label: 'Score',
          data: recentTests.map(result => result.score),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    const topicData = {
      labels: Object.keys(topicScores),
      datasets: [
        {
          label: 'Average Score',
          data: Object.values(topicScores).map(topic => topic.average),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ]
        }
      ]
    };
    
    setPerformanceData({
      topicScores,
      trendData,
      topicData,
      recentTests
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-600 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (testResults.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Test Results Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Take mock tests to track your progress and get AI-powered feedback.</p>
          <Link 
            to="/tests" 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Browse Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaChartLine className="text-primary mr-2" />
          <h2 className="text-xl font-semibold">Performance Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-3">Overall Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tests Completed</span>
                <span className="font-semibold">{testResults.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score</span>
                <span className="font-semibold">
                  {Math.round(testResults.reduce((acc, result) => acc + result.score, 0) / testResults.length)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Best Score</span>
                <span className="font-semibold text-green-600">
                  {Math.max(...testResults.map(result => result.score))}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Trend */}
          {performanceData && performanceData.recentTests.length > 1 && (
            <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-3">Recent Performance Trend</h3>
              <div className="h-40">
                <Bar 
                  data={performanceData.trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Topic Performance */}
      {performanceData && Object.keys(performanceData.topicScores).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Performance by Topic</h2>
          <div className="h-64">
            <Bar 
              data={performanceData.topicData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
      {/* Recent Tests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {testResults
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .map((result) => (
                  <tr key={result._id}>
                    <td className="px-4 py-3 whitespace-nowrap">{result.test.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{result.test.topic}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        result.score >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                        result.score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link 
                        to={`/test-results/${result._id}`}
                        className="text-primary hover:text-primary-dark hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="h-6 w-6 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Performance Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {generateAiSummary(testResults, user)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Areas of Strength</h3>
            <ul className="list-disc pl-5 space-y-1">
              {generateStrengths(testResults).map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Areas for Improvement</h3>
            <ul className="list-disc pl-5 space-y-1">
              {generateWeakAreas(testResults).map((area, index) => (
                <li key={index} className="text-sm">{area}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Interview Readiness Score</h3>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">Powered by AI</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
              <div 
                className={`h-2.5 rounded-full ${
                  calculateReadinessScore(testResults) >= 80 ? 'bg-green-600' :
                  calculateReadinessScore(testResults) >= 60 ? 'bg-blue-600' :
                  calculateReadinessScore(testResults) >= 40 ? 'bg-yellow-500' : 'bg-red-600'
                }`}
                style={{ width: `${calculateReadinessScore(testResults)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{calculateReadinessScore(testResults)}%</span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {calculateReadinessScore(testResults) >= 80 ? 'Excellent - You are well-prepared for technical interviews!' :
             calculateReadinessScore(testResults) >= 60 ? 'Good - You\'re on the right track for interview success.' :
             calculateReadinessScore(testResults) >= 40 ? 'Fair - Continue building your skills for interview readiness.' :
             'Needs work - Focus on core concepts to improve interview readiness.'}
          </p>
        </div>
      </div>

      {/* Recommended Tests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI-Recommended Tests</h2>
          <Link 
            to="/tests" 
            className="text-primary hover:text-primary-dark hover:underline text-sm"
          >
            View All Tests
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedTests(testResults, user).map((test, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{test.topic}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  test.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {test.difficulty}
                </span>
              </div>
              
              <h3 className="font-medium mb-2">{test.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {test.description}
              </p>
              
              <Link 
                to={`/tests/${test.id}`}
                className="block text-center bg-primary text-white text-sm py-1 px-3 rounded-md hover:bg-primary-dark transition-colors"
              >
                Take Test
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to generate personalized test recommendations
// Generate AI-like summary of performance
const generateAiSummary = (testResults, user) => {
  if (testResults.length === 0) {
    return "Complete your first test to get personalized AI insights on your performance.";
  }
  
  const avgScore = Math.round(testResults.reduce((acc, result) => acc + result.score, 0) / testResults.length);
  const testCount = testResults.length;
  const recentTests = [...testResults].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 3);
  const recentAvg = Math.round(recentTests.reduce((acc, result) => acc + result.score, 0) / recentTests.length);
  
  const trending = recentAvg > avgScore ? 'improving' : recentAvg < avgScore ? 'declining' : 'maintaining steady';
  
  // Get best and worst topics
  const topicScores = {};
  testResults.forEach(result => {
    const topic = result.test.topic;
    if (!topicScores[topic]) {
      topicScores[topic] = { total: 0, count: 0, average: 0 };
    }
    topicScores[topic].total += result.score;
    topicScores[topic].count += 1;
  });
  
  Object.keys(topicScores).forEach(topic => {
    topicScores[topic].average = topicScores[topic].total / topicScores[topic].count;
  });
  
  let bestTopic = null;
  let highestScore = -1;
  let weakestTopic = null;
  let lowestScore = 101;
  
  Object.keys(topicScores).forEach(topic => {
    if (topicScores[topic].average > highestScore) {
      highestScore = topicScores[topic].average;
      bestTopic = topic;
    }
    if (topicScores[topic].average < lowestScore) {
      lowestScore = topicScores[topic].average;
      weakestTopic = topic;
    }
  });
  
  let summary = "";
  
  if (testCount === 1) {
    summary = `You've completed your first test with a score of ${avgScore}%. `;
    if (avgScore >= 80) {
      summary += "Great start! You're showing strong understanding of the material.";
    } else if (avgScore >= 60) {
      summary += "Good start! Continue practicing to improve your understanding.";
    } else {
      summary += "You've taken your first step. With practice, you'll see improvement.";
    }
  } else {
    summary = `Based on your ${testCount} completed tests, you're averaging ${avgScore}% and your performance is ${trending}. `;
    
    if (bestTopic && weakestTopic) {
      summary += `Your strongest area is ${bestTopic} (${Math.round(highestScore)}%), while ${weakestTopic} (${Math.round(lowestScore)}%) presents an opportunity for growth. `;
    }
    
    // Add personalization if user has target companies
    if (user?.targetCompanies?.length > 0) {
      const company = user.targetCompanies[0];
      if (avgScore >= 70) {
        summary += `Your current performance suggests you're building a strong foundation for ${company} interviews.`;
      } else {
        summary += `Focus on improving your ${weakestTopic} skills to enhance your readiness for ${company} interviews.`;
      }
    } else {
      summary += `Continue practicing with our AI-generated tests to further improve your skills.`;
    }
  }
  
  return summary;
};

// Generate strength areas based on test results
const generateStrengths = (testResults) => {
  if (testResults.length === 0) return ["Complete tests to identify your strengths"];
  
  // Calculate performance by topic
  const topicPerformance = {};
  testResults.forEach(result => {
    const topic = result.test.topic;
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { scores: [], average: 0 };
    }
    topicPerformance[topic].scores.push(result.score);
  });
  
  // Calculate averages and find strengths (topics with average > 70%)
  const strengths = [];
  
  Object.entries(topicPerformance).forEach(([topic, data]) => {
    const avg = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
    topicPerformance[topic].average = Math.round(avg);
    
    if (avg >= 70) {
      strengths.push(`${topic}: ${Math.round(avg)}% proficiency`);
    }
  });
  
  // If no clear strengths yet
  if (strengths.length === 0) {
    const highestTopic = Object.entries(topicPerformance)
      .sort((a, b) => b[1].average - a[1].average)[0];
    
    if (highestTopic) {
      strengths.push(`${highestTopic[0]}: ${highestTopic[1].average}% (your best area)`);
    } else {
      strengths.push("Complete more tests to identify clear strengths");
    }
  }
  
  // Add some generic strengths based on overall performance
  const overallAvg = testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length;
  
  if (overallAvg >= 80) {
    strengths.push("Strong overall problem-solving ability");
  }
  
  if (strengths.length < 2) {
    strengths.push("Consistent test-taking practice");
  }
  
  return strengths;
};

// Generate weak areas based on test results
const generateWeakAreas = (testResults) => {
  if (testResults.length === 0) return ["Complete tests to identify areas for improvement"];
  
  // Calculate performance by topic
  const topicPerformance = {};
  testResults.forEach(result => {
    const topic = result.test.topic;
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { scores: [], average: 0 };
    }
    topicPerformance[topic].scores.push(result.score);
  });
  
  // Calculate averages and find weak areas (topics with average < 60%)
  const weakAreas = [];
  
  Object.entries(topicPerformance).forEach(([topic, data]) => {
    const avg = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
    topicPerformance[topic].average = Math.round(avg);
    
    if (avg < 60) {
      weakAreas.push(`${topic}: ${Math.round(avg)}% proficiency - needs attention`);
    }
  });
  
  // If no clear weak areas yet
  if (weakAreas.length === 0) {
    const lowestTopic = Object.entries(topicPerformance)
      .sort((a, b) => a[1].average - b[1].average)[0];
    
    if (lowestTopic) {
      weakAreas.push(`${lowestTopic[0]}: ${lowestTopic[1].average}% (room for improvement)`);
    } else {
      weakAreas.push("Complete more tests to identify areas for improvement");
    }
  }
  
  // Add suggestion based on test count
  if (testResults.length < 3) {
    weakAreas.push("Need more test data for comprehensive analysis");
  }
  
  return weakAreas;
};

// Calculate interview readiness score based on test performance
const calculateReadinessScore = (testResults) => {
  if (testResults.length === 0) return 30; // Default starting score
  
  // Calculate base score from test averages
  const avgScore = testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length;
  
  // Boost score based on test count (more tests = more practice)
  const testCountBonus = Math.min(10, testResults.length * 2); // Up to 10% bonus
  
  // Penalize for inconsistency
  const scores = testResults.map(result => result.score);
  const stdDev = calculateStandardDeviation(scores);
  const consistencyPenalty = Math.min(15, stdDev / 4); // Up to 15% penalty
  
  // Topic coverage bonus
  const uniqueTopics = new Set();
  testResults.forEach(result => uniqueTopics.add(result.test.topic));
  const topicBonus = Math.min(5, uniqueTopics.size); // Up to 5% bonus
  
  // Calculate final score
  const readinessScore = Math.min(100, Math.round(avgScore * 0.7 + testCountBonus + topicBonus - consistencyPenalty));
  
  return Math.max(10, readinessScore); // Minimum 10%
};

// Helper to calculate standard deviation
const calculateStandardDeviation = (values) => {
  if (values.length < 2) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
};

// Generate personalized test recommendations
const recommendedTests = (testResults, user) => {
  // This would be replaced with actual recommendations from the backend
  // For now, generate dummy recommendations based on user's test history
  
  // Get topics the user has tested on
  const testedTopics = new Set();
  testResults.forEach(result => {
    testedTopics.add(result.test.topic);
  });
  
  // Calculate average scores by topic
  const topicScores = {};
  testResults.forEach(result => {
    const topic = result.test.topic;
    if (!topicScores[topic]) {
      topicScores[topic] = { total: 0, count: 0, average: 0 };
    }
    topicScores[topic].total += result.score;
    topicScores[topic].count += 1;
  });
  
  Object.keys(topicScores).forEach(topic => {
    topicScores[topic].average = topicScores[topic].total / topicScores[topic].count;
  });
  
  // Generate recommendations
  const recommendations = [];
  
  // Recommendation 1: For the weakest topic
  let weakestTopic = null;
  let lowestScore = 101; // Higher than possible
  
  Object.keys(topicScores).forEach(topic => {
    if (topicScores[topic].average < lowestScore) {
      lowestScore = topicScores[topic].average;
      weakestTopic = topic;
    }
  });
  
  if (weakestTopic) {
    recommendations.push({
      id: 'rec-1',
      title: `Improve Your ${weakestTopic} Skills`,
      description: `AI-generated practice tests designed to strengthen your knowledge in ${weakestTopic}.`,
      topic: weakestTopic,
      difficulty: 'medium'
    });
  }
  
  // Recommendation 2: For a topic not tested yet
  const untested = ['Algorithms', 'Data Structures', 'System Design', 'Web Development', 'DBMS']
    .filter(topic => !testedTopics.has(topic));
    
  if (untested.length > 0) {
    const randomTopic = untested[Math.floor(Math.random() * untested.length)];
    recommendations.push({
      id: 'rec-2',
      title: `Explore ${randomTopic}`,
      description: `AI-generated introductory test to expand your knowledge in ${randomTopic}.`,
      topic: randomTopic,
      difficulty: 'easy'
    });
  }
  
  // Recommendation 3: Based on career goals (if available)
  if (user?.targetCompanies?.length > 0) {
    const company = user.targetCompanies[0];
    recommendations.push({
      id: 'rec-3',
      title: `${company} Interview Prep`,
      description: `AI-curated mock test based on real ${company} interview questions.`,
      topic: 'Interview Preparation',
      difficulty: 'hard'
    });
  } else {
    // Default recommendation
    recommendations.push({
      id: 'rec-3',
      title: 'Advanced Problem Solving',
      description: 'AI-generated advanced algorithmic problems similar to FAANG interviews.',
      topic: 'Algorithms',
      difficulty: 'hard'
    });
  }
  
  return recommendations;
};

export default TestPerformance;
