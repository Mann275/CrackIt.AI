import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestResults = () => {
  const { resultId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [test, setTest] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/test-results/${resultId}`);
        setResult(response.data);
        
        // Fetch the test details
        const testResponse = await axios.get(`/api/tests/${response.data.testId}`);
        setTest(testResponse.data);
        
        // Get AI analysis of the results
        try {
          const analysisResponse = await axios.get(`/api/test-results/${resultId}/analysis`);
          setAnalysis(analysisResponse.data);
        } catch (error) {
          console.error("Error fetching AI analysis:", error);
          // Set a default analysis object if API fails
          setAnalysis({
            accuracyPercentage: response.data.score,
            weakAreas: ["Unable to fetch detailed analysis"],
            suggestedNextSteps: ["Continue practicing on similar topics"],
            readinessScore: Math.round(response.data.score * 0.8),
            feedbackSummary: "Analysis not available at this time. Please try again later."
          });
        }
        
      } catch (error) {
        console.error('Error fetching test results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [resultId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!result || !test || !analysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center text-red-600">Results not found!</h1>
      </div>
    );
  }
  
  // Calculate percentage of questions answered correctly by topic
  const topicResults = {};
  test.questions.forEach((question, index) => {
    const topic = question.topic;
    if (!topicResults[topic]) {
      topicResults[topic] = { total: 0, correct: 0 };
    }
    
    topicResults[topic].total += 1;
    if (result.answers[question._id] === question.correctAnswer) {
      topicResults[topic].correct += 1;
    }
  });
  
  // Prepare chart data
  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [result.score, 100 - result.score],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#45a049', '#e53935']
      }
    ]
  };
  
  const barChartData = {
    labels: Object.keys(topicResults),
    datasets: [
      {
        label: 'Performance by Topic (%)',
        data: Object.values(topicResults).map(topic => 
          topic.total > 0 ? (topic.correct / topic.total) * 100 : 0
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };
  
  // Format time spent
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{test.title} Results</h1>
      
      {/* Score Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
            <div className="w-40 h-40">
              <Pie data={pieChartData} />
            </div>
            <div className="mt-4 text-3xl font-bold">{result.score}%</div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Questions</span>
                  <span className="font-medium">{test.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct Answers</span>
                  <span className="font-medium text-green-600">
                    {Math.round((result.score / 100) * test.questions.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect Answers</span>
                  <span className="font-medium text-red-600">
                    {test.questions.length - Math.round((result.score / 100) * test.questions.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Spent</span>
                  <span className="font-medium">{formatTime(result.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty</span>
                  <span className="font-medium">{test.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold mb-2">Performance Rating</h3>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  result.score >= 80 ? 'bg-green-500' : 
                  result.score >= 60 ? 'bg-blue-500' : 
                  result.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
            <div className="mt-2 text-center font-medium">
              {result.score >= 80 ? 'Excellent! You\'re well-prepared.' : 
               result.score >= 60 ? 'Good job! Keep practicing.' : 
               result.score >= 40 ? 'You\'re on the right track.' : 'More practice needed.'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance by Topic */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance by Topic</h2>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
      
      {/* AI Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI-Powered Analysis</h2>
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
            </div>
            <span className="text-sm text-blue-500 font-semibold">Powered by Gemini AI</span>
          </div>
        </div>
        
        {/* Feedback Summary */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h3 className="font-medium text-lg mb-2">AI Feedback Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">{analysis.feedbackSummary}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Readiness Score */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-center mb-3">Interview Readiness</h3>
            <div className="relative mx-auto w-32 h-32">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eaeaea"
                  strokeWidth="3"
                />
                <path className={`circle ${analysis.readinessScore >= 80 ? 'stroke-green-500' : 
                  analysis.readinessScore >= 60 ? 'stroke-blue-500' : 
                  analysis.readinessScore >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'}`}
                  strokeDasharray={`${analysis.readinessScore}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <text x="18" y="20.5" className="percentage">{analysis.readinessScore}%</text>
              </svg>
            </div>
            <p className="text-center text-sm mt-2">
              {analysis.readinessScore >= 80 ? 'You\'re ready for interviews!' : 
              analysis.readinessScore >= 60 ? 'Almost there, keep practicing!' : 
              analysis.readinessScore >= 40 ? 'Making good progress' : 'More preparation needed'}
            </p>
          </div>
          
          {/* Areas to Improve */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Areas to Focus On</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.weakAreas && analysis.weakAreas.map((area, index) => (
                <li key={index} className="text-sm">{area}</li>
              ))}
              {(!analysis.weakAreas || analysis.weakAreas.length === 0) && (
                <li className="text-sm">No specific weak areas identified</li>
              )}
            </ul>
          </div>
          
          {/* Recommended Next Steps */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Recommended Next Steps</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.suggestedNextSteps && analysis.suggestedNextSteps.map((step, index) => (
                <li key={index} className="text-sm">{step}</li>
              ))}
              {(!analysis.suggestedNextSteps || analysis.suggestedNextSteps.length === 0) && (
                <li className="text-sm">Continue practicing with more mock tests</li>
              )}
            </ul>
          </div>
        </div>
        
        <style jsx>{`
          .circular-chart {
            display: block;
            margin: 0 auto;
            max-width: 100%;
          }
          
          .circle {
            stroke-linecap: round;
            transition: stroke-dasharray 1s ease-out;
          }
          
          .stroke-green-500 {
            stroke: #10B981;
          }
          
          .stroke-blue-500 {
            stroke: #3B82F6;
          }
          
          .stroke-yellow-500 {
            stroke: #F59E0B;
          }
          
          .stroke-red-500 {
            stroke: #EF4444;
          }
          
          .percentage {
            fill: #666;
            font-family: sans-serif;
            font-size: 0.5em;
            text-anchor: middle;
          }
          
          .dark .percentage {
            fill: #CCC;
          }
          
          .circle-bg {
            stroke: #ddd;
          }
          
          .dark .circle-bg {
            stroke: #444;
          }
        `}</style>
      </div>
      
      {/* Question Review */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Question Review</h2>
        <div className="space-y-6">
          {test.questions.map((question, index) => {
            const userAnswer = result.answers[question._id] || 'Not answered';
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex justify-between">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <p className="mt-2">{question.question}</p>
                
                {question.type === 'multiple-choice' && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`p-2 rounded ${
                          option === question.correctAnswer ? 'bg-green-100 dark:bg-green-900' :
                          option === userAnswer && userAnswer !== question.correctAnswer ? 
                          'bg-red-100 dark:bg-red-900' : ''
                        }`}
                      >
                        <span className="mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                        {option}
                        {option === question.correctAnswer && 
                          <span className="ml-2 text-green-600">✓ Correct Answer</span>
                        }
                        {option === userAnswer && userAnswer !== question.correctAnswer && 
                          <span className="ml-2 text-red-600">✗ Your Answer</span>
                        }
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'coding' && (
                  <div className="mt-3">
                    <div className="mb-2">
                      <h4 className="font-medium">Your Solution:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                        <code>{userAnswer}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium">Expected Solution:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                        <code>{question.correctAnswer}</code>
                      </pre>
                    </div>
                  </div>
                )}
                
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                    <h4 className="font-medium">Explanation:</h4>
                    <p className="mt-1">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestResults;
