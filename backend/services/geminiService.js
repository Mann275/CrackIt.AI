const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAuQSPonqWljt4ck58NVqokpRlYQDTrEHg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate content using Gemini AI API
 * @param {string} prompt - The prompt to send to Gemini API
 * @returns {Promise<Object>} - The response from Gemini API
 */
const generateContent = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw new Error('Failed to generate content with Gemini API');
  }
};

/**
 * Generate roadmap for a user based on their skill survey
 * @param {Object} userData - User survey data including skills, target companies, domain
 * @returns {Promise<Object>} - Generated roadmap in JSON format
 */
const generateRoadmap = async (userData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an AI placement mentor and technical coach.
Based on this user profile for ${userData.userName || 'the user'}:
- Target Companies: ${userData.targetCompanies?.join(', ') || userData.targetCompany || 'Not specified'}
- Domain: ${userData.preferredDomain || userData.domain || 'Not specified'}
- Experience Level: ${userData.experience || 'Not specified'}
- Current Skills: ${JSON.stringify(userData.skills, null, 2)}
- Expected LPA: ${userData.expectedLPA || 'Not specified'}

Generate a detailed, structured learning roadmap that will help them prepare for technical interviews.
Focus on creating a progressive learning path that builds from fundamentals to advanced topics.

Return the response as valid JSON matching this structure:
{
  "roadmap": {
    "topics": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "timeEstimate": "string",
        "difficulty": "beginner|intermediate|advanced",
        "subtopics": [
          {
            "id": "string",
            "title": "string",
            "description": "string",
            "resources": [
              {
                "type": "video|article|tutorial|documentation|practice",
                "title": "string",
                "url": "string",
                "description": "string"
              }
            ]
          }
        ]
      }
    ],
    "overview": {
      "readinessScore": number,
      "focusAreas": ["string"],
      "weakAreas": ["string"],
      "estimatedTimeToCompletion": "string"
    },
    "weeklyPlan": [
      {
        "week": number,
        "theme": "string",
        "goals": ["string"],
        "topicsToFocus": ["string"],
        "estimatedHours": number
      }
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
};



/**
 * Get next milestones and recommendations based on current roadmap progress
 * @param {Object} roadmap - Current roadmap with progress
 * @returns {Promise<Object>} - Next milestones and recommendations
 */
const getNextMilestones = async (roadmap) => {
  try {
    const prompt = `
You are an AI career mentor tracking a student's interview preparation progress.

Current Progress:
- Completed Topics: ${roadmap.progress.completedTopics.join(', ')}
- Current Readiness: ${roadmap.progress.readinessScore}%
- Weak Areas: ${roadmap.overview.weakAreas.join(', ')}
- Weekly Progress: ${JSON.stringify(roadmap.weeklyPlan, null, 2)}

Analyze their progress and provide:
1. Next 3-5 key milestones they should focus on
2. Specific tips for their weak areas
3. Estimated timeline for each milestone

Return as JSON:
{
  "nextMilestones": [
    {
      "title": "string",
      "description": "string",
      "estimatedTime": "string",
      "priority": "high|medium|low"
    }
  ],
  "recommendations": {
    "weakAreaTips": [
      {
        "area": "string",
        "tips": ["string"]
      }
    ],
    "generalAdvice": "string"
  }
}
`;

    const response = await generateContent(prompt);
    const textContent = response.candidates[0].content.parts[0].text;
    const jsonMatch = textContent.match(/(\{[\s\S]*\})/);
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Get next milestones error:', error);
    throw error;
  }
};

/**
 * Get progress-based recommendations and updated readiness score
 * @param {Object} data - Current progress data
 * @returns {Promise<Object>} - Recommendations and updated score
 */
const getProgressRecommendations = async (data) => {
  try {
    const prompt = `
You are an AI interview preparation coach.

Current Status:
- Topics: ${JSON.stringify(data.topics, null, 2)}
- Completed Topics: ${data.completedTopics.join(', ')}
- Known Weak Areas: ${data.weakAreas.join(', ')}

Based on their progress:
1. Calculate an updated readiness score
2. Suggest next focus areas
3. Provide specific recommendations
4. Identify any potential gaps

Return as JSON:
{
  "updatedReadinessScore": number,
  "nextSteps": [
    {
      "focus": "string",
      "rationale": "string",
      "suggestedActions": ["string"]
    }
  ],
  "potentialGaps": ["string"]
}
`;

    const response = await generateContent(prompt);
    const textContent = response.candidates[0].content.parts[0].text;
    const jsonMatch = textContent.match(/(\{[\s\S]*\})/);
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Get progress recommendations error:', error);
    throw error;
  }
};

/**
 * Generate practice test based on domain and difficulty
 * @param {string} domain - The domain for the test (e.g., DSA, System Design)
 * @param {string} difficulty - Test difficulty level
 * @param {string} targetCompany - Company to generate test for
 * @returns {Promise<Object>} - Generated test questions
 */
const generateTest = async (domain, difficulty, targetCompany) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a ${difficulty} level technical test for ${targetCompany} in the ${domain} domain.
    Return exactly 10 multiple choice questions in this JSON format:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation",
          "topics": ["Topic1", "Topic2"]
        }
      ]
    }

    Ensure questions are company-specific and follow their interview patterns.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating test:', error);
    throw error;
  }
};

/**
 * Analyze test results and provide feedback
 * @param {Object} testData - Test performance data
 * @returns {Promise<Object>} - Analysis and recommendations
 */
const analyzeTestResult = async (testData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this test performance data:
    Total Questions: ${testData.totalQuestions}
    Correct Answers: ${testData.correctAnswers}
    Time Spent: ${testData.timeSpent} seconds
    Question Details: ${JSON.stringify(testData.questionDetails)}

    Provide analysis in this JSON format:
    {
      "weakAreas": [
        {
          "topic": "Topic Name",
          "accuracy": "percentage",
          "suggestions": ["suggestion1", "suggestion2"]
        }
      ],
      "overallFeedback": "Detailed feedback",
      "improvementAreas": ["area1", "area2"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing test result:', error);
    throw error;
  }
};

module.exports = {
  generateContent,
  generateRoadmap,
  generateTest,
  analyzeTestResult,
  getNextMilestones,
  getProgressRecommendations
};
