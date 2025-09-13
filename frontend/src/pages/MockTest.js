import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MockTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tests/${testId}`);
        setTest(response.data);
        setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [testId]);
  
  // Timer functionality
  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !testCompleted) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && testStarted && !testCompleted) {
      submitTest();
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, testStarted, testCompleted]);
  
  const startTest = () => {
    setTestStarted(true);
  };
  
  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const submitTest = async () => {
    try {
      setLoading(true);
      
      // Calculate score
      const totalQuestions = test.questions.length;
      let correctAnswers = 0;
      
      test.questions.forEach(question => {
        if (answers[question._id] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Submit test results to backend
      await axios.post('/api/test-results', {
        userId: user._id,
        testId: test._id,
        score,
        answers,
        timeSpent: test.duration * 60 - timeLeft,
        completedAt: new Date()
      });
      
      setTestCompleted(true);
      
      // Navigate to results page
      navigate(`/test-results/${test._id}`);
      
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!test) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-red-600">Test not found!</h1>
    </div>;
  }
  
  if (!testStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Topic:</span> {test.topic}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Duration:</span> {test.duration} minutes
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Total Questions:</span> {test.questions.length}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <span className="font-semibold">Difficulty:</span> {test.difficulty}
            </p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <p className="font-semibold mb-2">Instructions:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Once started, the timer cannot be paused</li>
                <li>You can navigate between questions</li>
                <li>Test will be automatically submitted when time expires</li>
                <li>Results will be analyzed by our AI for personalized feedback</li>
              </ul>
            </div>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }
  
  if (testCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Test Submitted!</h1>
          <p className="mb-6">Your answers have been recorded and are being processed.</p>
          <button
            onClick={() => navigate(`/test-results/${test._id}`)}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = test.questions[currentQuestionIndex];
  
  // Format time remaining
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <div className="flex items-center">
          <span className="mr-2">Time Remaining:</span>
          <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : ''}`}>
            {formattedTime}
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between mb-4">
          <span className="font-semibold">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentQuestion.difficulty}
          </span>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl mb-4">{currentQuestion.question}</h2>
          
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${currentQuestion._id}`}
                    value={option}
                    checked={answers[currentQuestion._id] === option}
                    onChange={() => handleAnswerChange(currentQuestion._id, option)}
                    className="mr-3"
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'coding' && (
            <div>
              <textarea
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm h-64 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Write your solution here..."
              ></textarea>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`py-2 px-4 rounded-md ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            Previous
          </button>
          
          {currentQuestionIndex < test.questions.length - 1 ? (
            <button
              onClick={goToNextQuestion}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitTest}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-3">Question Navigation</h3>
        <div className="flex flex-wrap gap-2">
          {test.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-md flex items-center justify-center ${
                index === currentQuestionIndex
                  ? 'bg-primary text-white'
                  : answers[test.questions[index]._id]
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockTest;
