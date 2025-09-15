const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIRoadmap = require('../models/AIRoadmap');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Helper function to clean JSON response
function cleanJsonString(str) {
    let cleaned = str
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/\*\*/g, '')
        .trim();

    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
    }

    cleaned = cleaned
        .replace(/(?<!\\)\\(?!["\\\/bfnrt])/g, '\\\\')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    return cleaned;
}

// Helper function to validate and fix resource URLs
function validateResourceUrls(roadmapData) {
    if (!roadmapData?.nodes) return roadmapData;

    const commonPrefixes = ['http://', 'https://'];
    const defaultUrlsByType = {
        'documentation': 'https://developer.mozilla.org/',
        'tutorial': 'https://www.w3schools.com/',
        'video': 'https://www.youtube.com/results?search_query=programming+tutorial',
        'interactive': 'https://www.codecademy.com/',
        'article': 'https://dev.to/',
        'community': 'https://stackoverflow.com/'
    };

    roadmapData.nodes.forEach(node => {
        if (node.data?.resources) {
            node.data.resources.forEach(resource => {
                if (!resource.url || !commonPrefixes.some(prefix => resource.url.startsWith(prefix))) {
                    const searchQuery = resource.title?.toLowerCase().split(' ').filter(w => w.length > 3).join('+') || 'programming+tutorial';
                    resource.url = defaultUrlsByType[resource.type] || `https://www.google.com/search?q=${searchQuery}`;
                }
            });
        }
    });

    return roadmapData;
}

// Generate AI roadmap
exports.generateRoadmap = async (req, res) => {
    try {
        const { goals, currentLevel, interests = [], timeCommitment } = req.body;
        const userId = req.user._id;

        const mainSubject = Array.isArray(interests) && interests.length > 0 
            ? interests[0].trim()
            : goals.toLowerCase().match(/learn\s+([a-z0-9\s]+)/i)?.[1]?.trim().split(/\s+/)[0] || "programming";

        // Create prompt for Google AI
        const prompt = `Create a detailed learning roadmap for ${mainSubject} as a JSON object with the following requirements:

Goals: ${goals}
Current Level: ${currentLevel}
Areas of Interest: ${interests.join(', ')}
Time Commitment: ${timeCommitment}

The roadmap should include:
1. A metadata section with title, description, and theme support
2. Nodes representing milestones/topics with:
   - Clear labels and descriptions
   - Detailed content explaining concepts
   - 2-3 practical exercises with difficulty levels
   - 3-5 high-quality learning resources with URLs
   - Time estimates and difficulty ratings
3. Edges connecting related topics
4. Progressive difficulty based on the user's current level
5. Realistic time estimates based on the time commitment

Return ONLY valid JSON without any markdown or code blocks.`;

        // Generate roadmap using Google AI
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Clean and parse the response
        const cleanedText = cleanJsonString(rawText);
        let roadmapData = JSON.parse(cleanedText);

        // Validate and fix resource URLs
        roadmapData = validateResourceUrls(roadmapData);

        // Create new AIRoadmap document
        const newRoadmap = new AIRoadmap({
            userId,
            goals,
            currentLevel,
            interests,
            timeCommitment,
            roadmapData
        });

        await newRoadmap.save();
        res.status(200).json(newRoadmap);

    } catch (error) {
        console.error('Error generating AI roadmap:', error);
        res.status(500).json({ 
            message: 'Failed to generate roadmap',
            error: error.message 
        });
    }
};

// Get user's AI roadmap
exports.getRoadmap = async (req, res) => {
    try {
        const userId = req.user._id;
        const roadmap = await AIRoadmap.findOne({ userId }).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found' });
        }

        res.status(200).json(roadmap);
    } catch (error) {
        console.error('Error fetching AI roadmap:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update node progress in AI roadmap
exports.updateProgress = async (req, res) => {
    try {
        const { nodeId, status, progress } = req.body;
        const userId = req.user._id;

        const roadmap = await AIRoadmap.findOne({ userId }).sort({ createdAt: -1 });
        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found' });
        }

        await roadmap.updateNodeStatus(nodeId, status, progress);
        const overallProgress = roadmap.calculateProgress();
        const nextNode = roadmap.getNextRecommendedNode();

        res.status(200).json({ 
            message: 'Progress updated successfully',
            overallProgress,
            nextRecommendedNode: nextNode
        });
    } catch (error) {
        console.error('Error updating AI roadmap progress:', error);
        res.status(500).json({ message: error.message });
    }
};