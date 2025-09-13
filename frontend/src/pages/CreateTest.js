import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const CreateTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: 'medium',
    duration: 30, // minutes
    questions: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    topic: '',
    points: 1
  });
  
  const [step, setStep] = useState(1);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData({
      ...testData,
      [name]: value
    });
  };
  
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value
    });
  };
  
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };
  
  const addOption = () => {
    if (currentQuestion.options.length < 8) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, '']
      });
    }
  };
  
  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const updatedOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion({
        ...currentQuestion,
        options: updatedOptions,
        correctAnswer: currentQuestion.correctAnswer === currentQuestion.options[index] 
          ? '' 
          : currentQuestion.correctAnswer
      });
    }
  };
  
  const addQuestion = () => {
    // Validate question
    if (!currentQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }
    
    if (currentQuestion.type === 'multiple-choice') {
      // Validate options
      if (currentQuestion.options.some(opt => !opt.trim())) {
        setError('All options must have text');
        return;
      }
      
      // Validate correct answer
      if (!currentQuestion.correctAnswer) {
        setError('Please select the correct answer');
        return;
      }
    } else if (currentQuestion.type === 'coding') {
      // Validate correct answer for coding question
      if (!currentQuestion.correctAnswer.trim()) {
        setError('Please provide a sample solution');
        return;
      }
    }
    
    // Add question to test
    setTestData({
      ...testData,
      questions: [...testData.questions, {...currentQuestion}]
    });
    
    // Reset current question
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      topic: currentQuestion.topic, // Keep the same topic
      points: 1
    });
    
    setError('');
  };
  
  const removeQuestion = (index) => {
    const updatedQuestions = testData.questions.filter((_, i) => i !== index);
    setTestData({
      ...testData,
      questions: updatedQuestions
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate test data
    if (!testData.title.trim()) {
      setError('Test title is required');
      return;
    }
    
    if (!testData.description.trim()) {
      setError('Test description is required');
      return;
    }
    
    if (!testData.topic.trim()) {
      setError('Test topic is required');
      return;
    }
    
    if (testData.questions.length === 0) {
      setError('Add at least one question to the test');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/tests', testData);
      
      // Redirect to test page
      navigate(`/tests/${response.data._id}`);
    } catch (err) {
      console.error('Error creating test:', err);
      setError('Failed to create test. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => {
    // Validate step 1
    if (step === 1) {
      if (!testData.title.trim() || !testData.description.trim() || !testData.topic.trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    setStep(step + 1);
    setError('');
  };
  
  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Test</h1>
      
      {/* Steps indicator */}
      <div className="flex mb-8">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
            step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div>Test Details</div>
        </div>
        
        <div className="w-full flex-1 flex items-center justify-center">
          <div className={`h-1 w-full ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        </div>
        
        <div className={`flex-1 text-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
            step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div>Add Questions</div>
        </div>
        
        <div className="w-full flex-1 flex items-center justify-center">
          <div className={`h-1 w-full ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        </div>
        
        <div className={`flex-1 text-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
            step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
          <div>Review & Save</div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Step 1: Test Details */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="title"
                value={testData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter test title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description <span className="text-red-600">*</span></label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32"
                placeholder="Enter test description"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="topic"
                  value={testData.topic}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Data Structures"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={testData.difficulty}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={testData.duration}
                  onChange={handleChange}
                  min="5"
                  max="180"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={nextStep}
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Next: Add Questions
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Add Questions */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Questions</h2>
            
            <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 rounded-md">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Question Text <span className="text-red-600">*</span></label>
                <textarea
                  name="question"
                  value={currentQuestion.question}
                  onChange={handleQuestionChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter question text"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Type</label>
                  <select
                    name="type"
                    value={currentQuestion.type}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={currentQuestion.difficulty}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={currentQuestion.topic}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Arrays"
                  />
                </div>
              </div>
              
              {currentQuestion.type === 'multiple-choice' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Options <span className="text-red-600">*</span></label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={currentQuestion.correctAnswer === option}
                          onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: option})}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                          disabled={currentQuestion.options.length <= 2}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {currentQuestion.options.length < 8 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center"
                    >
                      <FaPlus className="mr-1" /> Add Option
                    </button>
                  )}
                </div>
              )}
              
              {currentQuestion.type === 'coding' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Sample Solution <span className="text-red-600">*</span></label>
                  <textarea
                    name="correctAnswer"
                    value={currentQuestion.correctAnswer}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="Enter sample solution code"
                    rows="6"
                  ></textarea>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Explanation</label>
                <textarea
                  name="explanation"
                  value={currentQuestion.explanation}
                  onChange={handleQuestionChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Explain why the answer is correct"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Question
                </button>
              </div>
            </div>
            
            {/* Questions list */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Questions Added ({testData.questions.length})</h3>
              
              {testData.questions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No questions added yet. Add at least one question to continue.
                </div>
              ) : (
                <div className="space-y-3">
                  {testData.questions.map((q, index) => (
                    <div 
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Q{index + 1}:</span>
                          <span className="line-clamp-1">{q.question}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                          <span>{q.type === 'multiple-choice' ? 'Multiple Choice' : 'Coding'}</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                          {q.topic && (
                            <>
                              <span>•</span>
                              <span>{q.topic}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={nextStep}
                disabled={testData.questions.length === 0}
                className={`py-2 px-4 rounded-md ${
                  testData.questions.length === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-primary text-white hover:bg-primary-dark'
                } transition-colors`}
              >
                Next: Review
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Review & Save */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review & Save</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Test Details</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                    <p className="font-medium">{testData.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Topic</p>
                    <p className="font-medium">{testData.topic}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
                    <p className="font-medium capitalize">{testData.difficulty}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium">{testData.duration} minutes</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p>{testData.description}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Questions ({testData.questions.length})</h3>
              
              <div className="space-y-4">
                {testData.questions.map((q, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {q.difficulty}
                        </span>
                        {q.type === 'coding' && (
                          <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Coding
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="mb-3">{q.question}</p>
                    
                    {q.type === 'multiple-choice' && (
                      <div className="space-y-2 ml-4">
                        {q.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`p-2 rounded ${option === q.correctAnswer ? 'bg-green-100 dark:bg-green-900' : ''}`}
                          >
                            <span className="mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {option === q.correctAnswer && (
                              <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === 'coding' && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Solution:</p>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                          <code>{q.correctAnswer}</code>
                        </pre>
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Explanation:</p>
                        <p className="text-sm">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`py-2 px-4 rounded-md flex items-center ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save Test
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
