const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with the provided API key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
    const prompt = `
You are an AI placement mentor.
Based on this user profile:
- Target Company: ${userData.targetCompanies.join(', ')}
- Domain: ${userData.preferredDomain}
- Expected LPA: ${userData.expectedLPA}
- Current Skills:
  * DSA Skills:
    - Arrays: ${userData.skills.dsaSkills.arrays}/10
    - Linked Lists: ${userData.skills.dsaSkills.linkedLists}/10
    - Stacks: ${userData.skills.dsaSkills.stacks}/10
    - Queues: ${userData.skills.dsaSkills.queues}/10
    - Trees: ${userData.skills.dsaSkills.trees}/10
    - Graphs: ${userData.skills.dsaSkills.graphs}/10
    - DP: ${userData.skills.dsaSkills.dp}/10
    - Recursion: ${userData.skills.dsaSkills.recursion}/10
    - Searching: ${userData.skills.dsaSkills.searching}/10
    - Sorting: ${userData.skills.dsaSkills.sorting}/10
  * Core CS Skills:
    - DBMS: ${userData.skills.coreCSSkills.dbms}/10
    - OS: ${userData.skills.coreCSSkills.os}/10
    - Computer Networks: ${userData.skills.coreCSSkills.cn}/10
    - OOP: ${userData.skills.coreCSSkills.oops}/10
  * Development Experience:
    - Web: ${userData.skills.devExperience.web}/10
    - App: ${userData.skills.devExperience.app}/10
    - ML: ${userData.skills.devExperience.ml}/10
    - Cloud: ${userData.skills.devExperience.cloud}/10
    - Tech Stack: ${userData.techStack.join(', ')}

Generate a personalized placement roadmap in JSON format with:
1. Ordered topics to study (DSA, Core CS, Development) based on weakness areas.
2. Suggested timeline (weekly goals) for the next 12 weeks.
3. Checklist structure for each week (array of objects with 'task' and 'completed' properties).
4. Readiness percentage estimation for the target companies.

Respond ONLY with valid JSON in the following format:
{
  "roadmap": {
    "readinessPercentage": number,
    "focusAreas": ["string", "string", ...],
    "weakAreas": ["string", "string", ...],
    "weeklyPlan": [
      {
        "week": number,
        "theme": "string",
        "goals": ["string", "string", ...]
      },
      ...
    ],
    "checklist": [
      {
        "id": "string",
        "task": "string",
        "completed": boolean,
        "category": "string"
      },
      ...
    ]
  }
}
`;

    const response = await generateContent(prompt);
    
    // Extract JSON from response
    const textContent = response.candidates[0].content.parts[0].text;
    const jsonMatch = textContent.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        const roadmapJson = JSON.parse(jsonMatch[0]);
        return roadmapJson;
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        throw new Error('Failed to parse Gemini response as JSON');
      }
    } else {
      throw new Error('No valid JSON found in Gemini response');
    }
  } catch (error) {
    console.error('Roadmap generation error:', error);
    throw error;
  }
};

/**
 * Generate mock test questions based on topic
 * @param {string} topic - Topic for which to generate questions
 * @param {number} questionCount - Number of questions to generate (default: 10)
 * @returns {Promise<Array>} - Array of questions with options and answers
 */
const generateMockTest = async (topic, questionCount = 10) => {
  try {
    const prompt = `
Generate ${questionCount} multiple-choice technical questions for placement preparation.
Focus on ${topic}.
Return output in JSON format with:
- question
- options (a,b,c,d)
- correct_answer
- explanation

Respond ONLY with valid JSON in the following format:
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": {
        "a": "string",
        "b": "string",
        "c": "string",
        "d": "string"
      },
      "correctAnswer": "string",
      "explanation": "string",
      "topic": "string"
    },
    ...
  ]
}
`;

    const response = await generateContent(prompt);
    
    // Extract JSON from response
    const textContent = response.candidates[0].content.parts[0].text;
    const jsonMatch = textContent.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        const questionsJson = JSON.parse(jsonMatch[0]);
        return questionsJson;
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        throw new Error('Failed to parse Gemini response as JSON');
      }
    } else {
      throw new Error('No valid JSON found in Gemini response');
    }
  } catch (error) {
    console.error('Mock test generation error:', error);
    throw error;
  }
};

/**
 * Generate test result analysis and feedback
 * @param {Object} testData - Test results data
 * @param {string} company - Target company
 * @returns {Promise<Object>} - Analysis and feedback
 */
const analyzeTestResults = async (testData, company) => {
  try {
    // Prepare the test data in a structured format
    const userAnswers = testData.answers.map(a => {
      const topicInfo = a.topic ? ` (Topic: ${a.topic})` : '';
      return `Q${a.questionId}${topicInfo}: User answered "${a.userAnswer}", Correct answer: "${a.correctAnswer}"`;
    }).join('\n');
    
    // Group questions by topic for better analysis
    const topicCounts = {};
    const topicResults = {};
    
    testData.answers.forEach(answer => {
      const topic = answer.topic || testData.topic;
      const isCorrect = answer.userAnswer === answer.correctAnswer;
      
      if (!topicCounts[topic]) {
        topicCounts[topic] = { total: 0, correct: 0 };
      }
      
      topicCounts[topic].total++;
      if (isCorrect) topicCounts[topic].correct++;
    });
    
    // Calculate performance by topic
    Object.keys(topicCounts).forEach(topic => {
      const accuracy = (topicCounts[topic].correct / topicCounts[topic].total) * 100;
      topicResults[topic] = {
        accuracy: Math.round(accuracy),
        questions: topicCounts[topic].total,
        correct: topicCounts[topic].correct
      };
    });
    
    const topicAnalysis = Object.entries(topicResults)
      .map(([topic, data]) => `${topic}: ${data.correct}/${data.questions} correct (${data.accuracy}%)`)
      .join('\n');
    
    const prompt = `
You are an expert technical interviewer and mentor.

Analyze the following coding test results:
- Test topic: ${testData.topic}
- Overall score: ${testData.score}%
- Total questions: ${testData.totalQuestions}

Topic breakdown:
${topicAnalysis}

Sample of user's answers:
${userAnswers.slice(0, 1500)}

Based on this performance, please provide:
1. Specific weak areas that need improvement (topics/concepts where the user struggled)
2. Concrete next steps and study resources to improve (3-5 actionable recommendations)
3. Interview readiness score (0-100) for ${company} based on this performance
4. A personalized feedback summary (2-3 sentences that are encouraging but honest)

Respond ONLY with valid JSON in the following format:
{
  "analysis": {
    "accuracyPercentage": number,
    "weakAreas": ["string", "string", ...],
    "suggestedNextSteps": ["string", "string", ...],
    "readinessScore": number,
    "feedbackSummary": "string"
  }
}
`;

    const response = await generateContent(prompt);
    
    // Extract JSON from response
    const textContent = response.candidates[0].content.parts[0].text;
    const jsonMatch = textContent.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        const analysisJson = JSON.parse(jsonMatch[0]);
        return analysisJson;
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        throw new Error('Failed to parse Gemini response as JSON');
      }
    } else {
      throw new Error('No valid JSON found in Gemini response');
    }
  } catch (error) {
    console.error('Test analysis error:', error);
    throw error;
  }
};

module.exports = {
  generateContent,
  generateRoadmap,
  generateMockTest,
  analyzeTestResults
};
