const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const geminiService = require('../services/geminiService');

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    
    // Build filter object
    const filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    
    const tests = await Test.find(filter)
      .select('-questions.correctAnswer') // Don't send correct answers to the client
      .sort({ createdAt: -1 });
    
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Remove correct answers before sending to client
    const testWithoutAnswers = test.toObject();
    testWithoutAnswers.questions.forEach(question => {
      delete question.correctAnswer;
    });
    
    res.json(testWithoutAnswers);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new test
exports.createTest = async (req, res) => {
  try {
    const { title, description, topic, difficulty, duration, questions, useAI } = req.body;
    
    let questionsData = questions;
    
    // If AI generation is requested, use Gemini to generate questions
    if (useAI) {
      try {
        console.log('Generating questions using AI for topic:', topic);
        const questionCount = req.body.questionCount || 10;
        
        // Get AI-generated questions from Gemini
        const aiQuestions = await geminiService.generateMockTest(topic, questionCount);
        
        if (aiQuestions && aiQuestions.questions && aiQuestions.questions.length > 0) {
          questionsData = aiQuestions.questions;
          console.log(`Successfully generated ${questionsData.length} questions using AI`);
        } else {
          return res.status(500).json({ message: 'Failed to generate questions with AI' });
        }
      } catch (aiError) {
        console.error('Error generating questions with AI:', aiError);
        return res.status(500).json({ message: 'Failed to generate questions with AI' });
      }
    } else {
      // Validate manually entered questions
      if (!title || !description || !topic || !difficulty || !duration || !questions || !questions.length) {
        return res.status(400).json({ message: 'All fields are required' });
      }
    }
    
    // Create new test
    const newTest = new Test({
      title,
      description,
      topic,
      difficulty,
      duration,
      questions: questionsData,
      createdBy: req.user.id,
      isAIGenerated: useAI
    });
    
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a test
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Check if user is authorized (test creator or admin)
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this test' });
    }
    
    const { title, description, topic, difficulty, duration, questions } = req.body;
    
    // Update fields
    if (title) test.title = title;
    if (description) test.description = description;
    if (topic) test.topic = topic;
    if (difficulty) test.difficulty = difficulty;
    if (duration) test.duration = duration;
    if (questions) test.questions = questions;
    
    await test.save();
    res.json(test);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a test
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Check if user is authorized (test creator or admin)
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this test' });
    }
    
    await test.remove();
    
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit test results
exports.submitTestResult = async (req, res) => {
  try {
    const { testId, answers, timeSpent } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!testId || !answers || timeSpent === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get test for score calculation
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Calculate score
    let correctCount = 0;
    test.questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / test.questions.length) * 100);
    
    // Create test result
    const newResult = new TestResult({
      user: userId,
      test: testId,
      score,
      answers,
      timeSpent,
      completedAt: new Date()
    });
    
    await newResult.save();
    
    // Update user's test history
    await User.findByIdAndUpdate(
      userId,
      { $push: { testResults: newResult._id } }
    );
    
    // Increment test attempt count
    await Test.findByIdAndUpdate(
      testId,
      { $inc: { attempts: 1 } }
    );
    
    // Perform AI analysis asynchronously
    try {
      // Get user data for personalized analysis
      const user = await User.findById(userId).select('skills targetCompanies');
      
      // Prepare test data for analysis
      const testData = {
        topic: test.topic,
        score,
        totalQuestions: test.questions.length,
        answers: []
      };
      
      // Format answers for AI analysis
      test.questions.forEach((question, index) => {
        const questionId = question._id.toString();
        const userAnswer = answers[questionId] || '';
        
        testData.answers.push({
          questionId: index + 1,
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          topic: question.topic || test.topic
        });
      });
      
      // Get company to analyze readiness for
      const company = user.targetCompanies && user.targetCompanies.length > 0 
        ? user.targetCompanies[0] 
        : 'tech companies';
      
      // Call Gemini for analysis (don't await to avoid blocking response)
      geminiService.analyzeTestResults(testData, company)
        .then(async (analysis) => {
          // Update the test result with AI analysis
          newResult.aiAnalysis = analysis.analysis;
          await newResult.save();
          console.log(`AI analysis completed for test result ${newResult._id}`);
        })
        .catch(error => {
          console.error('Error in async AI analysis:', error);
        });
    } catch (aiError) {
      console.error('Error initiating AI analysis:', aiError);
      // Proceed without blocking the response
    }
    
    res.status(201).json(newResult);
  } catch (error) {
    console.error('Error submitting test result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get test result by ID
exports.getTestResult = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await TestResult.findById(resultId)
      .populate({
        path: 'test',
        select: 'title topic difficulty duration questions'
      });
    
    if (!result) {
      return res.status(404).json({ message: 'Test result not found' });
    }
    
    // Check if user is authorized to view this result
    if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this test result' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get AI analysis of test result
exports.getTestResultAnalysis = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await TestResult.findById(resultId)
      .populate({
        path: 'test',
        select: 'title topic difficulty questions'
      })
      .populate({
        path: 'user',
        select: 'skills targetCompanies'
      });
    
    if (!result) {
      return res.status(404).json({ message: 'Test result not found' });
    }
    
    // Check if user is authorized to view this result
    if (result.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this test result' });
    }
    
    // If AI analysis already exists and is complete, return it
    if (result.aiAnalysis && result.aiAnalysis.weakAreas && result.aiAnalysis.weakAreas.length > 0) {
      return res.json(result.aiAnalysis);
    }
    
    // If no AI analysis yet, generate it on demand
    try {
      // Prepare test data for analysis
      const testData = {
        topic: result.test.topic,
        score: result.score,
        totalQuestions: result.test.questions.length,
        answers: []
      };
      
      // Format answers for AI analysis
      result.test.questions.forEach((question, index) => {
        const questionId = question._id.toString();
        const userAnswer = result.answers.get(questionId) || '';
        
        testData.answers.push({
          questionId: index + 1,
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          topic: question.topic || result.test.topic
        });
      });
      
      // Get company to analyze readiness for
      const company = result.user.targetCompanies && result.user.targetCompanies.length > 0 
        ? result.user.targetCompanies[0] 
        : 'tech companies';
      
      // Call Gemini for analysis
      const analysisResult = await geminiService.analyzeTestResults(testData, company);
      
      // Save the AI analysis to the test result
      result.aiAnalysis = {
        accuracyPercentage: result.score,
        weakAreas: analysisResult.analysis.weakAreas || [],
        suggestedNextSteps: analysisResult.analysis.recommendations || [],
        readinessScore: analysisResult.analysis.readinessScore || Math.round(result.score * 0.8),
        feedbackSummary: analysisResult.analysis.summary || "Keep practicing to improve your skills!"
      };
      
      await result.save();
      
      res.json(result.aiAnalysis);
    } catch (aiError) {
      console.error('Error getting AI analysis:', aiError);
      
      // Fallback analysis if AI service is unavailable
      const fallbackAnalysis = generateFallbackAnalysis(result);
      
      // Save fallback analysis to result
      result.aiAnalysis = {
        accuracyPercentage: result.score,
        weakAreas: fallbackAnalysis.areasToImprove,
        suggestedNextSteps: fallbackAnalysis.recommendations.map(rec => `${rec.title}: ${rec.description}`),
        readinessScore: Math.round(result.score * 0.8),
        feedbackSummary: "Analysis generated using basic metrics. For more detailed insights, try again later."
      };
      
      await result.save();
      
      res.json(result.aiAnalysis);
    }
  } catch (error) {
    console.error('Error fetching test result analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate fallback analysis if AI service is unavailable
const generateFallbackAnalysis = (result) => {
  const score = result.score;
  let strengths = [];
  let areasToImprove = [];
  
  // Analyze performance by topic
  const topicPerformance = {};
  
  result.test.questions.forEach(question => {
    const topic = question.topic;
    const isCorrect = result.answers[question._id] === question.correctAnswer;
    
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { total: 0, correct: 0 };
    }
    
    topicPerformance[topic].total += 1;
    if (isCorrect) {
      topicPerformance[topic].correct += 1;
    }
  });
  
  // Identify strengths and weaknesses
  Object.entries(topicPerformance).forEach(([topic, data]) => {
    const percentage = (data.correct / data.total) * 100;
    
    if (percentage >= 70) {
      strengths.push(`Strong performance in ${topic} (${Math.round(percentage)}% correct).`);
    } else {
      areasToImprove.push(`Needs improvement in ${topic} (${Math.round(percentage)}% correct).`);
    }
  });
  
  // Default messages if no specific strengths/weaknesses identified
  if (strengths.length === 0) {
    strengths = ['Keep practicing to build your strengths.'];
  }
  
  if (areasToImprove.length === 0) {
    areasToImprove = ['Continue practicing to maintain your performance.'];
  }
  
  // Generic recommendations based on score
  const recommendations = [
    {
      title: 'GeeksforGeeks Practice',
      url: 'https://practice.geeksforgeeks.org/',
      description: 'Practice coding problems by difficulty level and topic.'
    },
    {
      title: 'LeetCode',
      url: 'https://leetcode.com/',
      description: 'Enhance your coding skills with algorithm challenges.'
    },
    {
      title: 'System Design Primer',
      url: 'https://github.com/donnemartin/system-design-primer',
      description: 'Learn about system design concepts and practice.'
    }
  ];
  
  return {
    strengths,
    areasToImprove,
    recommendations
  };
};
