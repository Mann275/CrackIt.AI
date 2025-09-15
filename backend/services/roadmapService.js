const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Generates a personalized study roadmap based on user's survey data
 */
async function generateRoadmap(surveyData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare prompt for Gemini
    const prompt = `
      Create a detailed study roadmap for a placement preparation candidate with the following profile:
      - Domain: ${surveyData.domain}
      - Target Company: ${surveyData.targetCompany}
      - Expected LPA: ${surveyData.expectedLPA}
      - Current Skills: ${surveyData.currentSkills.map(skill => `${skill.name} (${skill.confidenceLevel}% confident)`).join(', ')}

      Generate a week-by-week learning roadmap as a JSON object:
      {
        "readiness_score": number,
        "Week 1": [
          {
            "topic": string,
            "estimated_hours": number,
            "priority": "High" | "Medium" | "Low",
            "description": string
          }
        ],
        "Week 2": [...],
        ...
      }

      Rules:
      - Each week should have 3-4 topics
      - Prioritize based on skill confidence
      - Include estimated hours for each topic
      - Provide specific descriptions
      - Order topics by dependencies
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawRoadmap = JSON.parse(response.text());

    // Transform the raw roadmap into React Flow format
    const nodes = [];
    const edges = [];
    let xPosition = 0;
    let weekCount = 0;
    let lastNodeId = null;

    // Process each week's data
    Object.entries(rawRoadmap).forEach(([week, topics]) => {
      if (week.startsWith('Week')) {
        weekCount++;
        topics.forEach((topic, index) => {
          const nodeId = `node-${weekCount}-${index}`;
          const yPosition = index * 200; // Space topics vertically

          // Create node
          nodes.push({
            id: nodeId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
              label: topic.topic,
              topic: topic.topic,
              timeEstimate: `${topic.estimated_hours}h`,
              priority: topic.priority,
              completed: false,
              description: topic.description,
              resources: [] // Can be populated with recommended resources later
            },
            week: weekCount
          });

          // Create edge from previous node if exists
          if (lastNodeId) {
            edges.push({
              id: `edge-${lastNodeId}-${nodeId}`,
              source: lastNodeId,
              target: nodeId,
              type: 'smoothstep',
              animated: true
            });
          }

          lastNodeId = nodeId;
        });

        xPosition += 300; // Move to next week's x position
      }
    });

    return {
      nodes,
      edges,
      totalWeeks: weekCount,
      readinessScore: rawRoadmap.readiness_score || 0
    };
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate roadmap');
  }
}

/**
 * Generate recommendations based on progress
 */
async function getProgressRecommendations(roadmapData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const completedNodes = roadmapData.nodes.filter(node => node.data.completed);
    const incompletePriorityNodes = roadmapData.nodes
      .filter(node => !node.data.completed && node.data.priority === 'High')
      .map(node => node.data.topic);

    const prompt = `
      As an AI placement mentor, analyze this progress:
      - Overall Progress: ${roadmapData.progress}%
      - Readiness Score: ${roadmapData.readinessScore}%
      - Completed Topics: ${completedNodes.map(node => node.data.topic).join(', ')}
      - High Priority Incomplete Topics: ${incompletePriorityNodes.join(', ')}
      
      Provide focused recommendations. Return as JSON:
      {
        "nextSteps": ["recommendation1", "recommendation2"],
        "updatedReadinessScore": number
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendations = JSON.parse(response.text());

    return {
      nextSteps: recommendations.nextSteps,
      updatedReadinessScore: recommendations.updatedReadinessScore
    };
  } catch (error) {
    console.error('Error getting progress recommendations:', error);
    return {
      nextSteps: ['Continue focusing on incomplete high-priority topics'],
      updatedReadinessScore: roadmapData.readinessScore
    };
  }
}

module.exports = {
  generateRoadmap,
  getProgressRecommendations
};