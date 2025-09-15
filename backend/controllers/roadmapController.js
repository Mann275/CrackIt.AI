const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// Generate roadmap for user based on survey data
exports.generateRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get survey data from request
    const { domain, currentSkills, targetCompany, expectedLPA } = req.body;
    
    if (!domain || !currentSkills || !targetCompany || !expectedLPA) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Generate personalized roadmap using Gemini AI
    const data = await geminiService.generateRoadmap({
      domain,
      currentSkills,
      targetCompany,
      expectedLPA,
      userName: user.name
    });
    
    // Convert topics to React Flow nodes and edges
    const nodes = [];
    const edges = [];
    let xPosition = 0;
    let maxNodesInWeek = 0;
    
    data.roadmap.topics.forEach((topic, topicIndex) => {
      const week = Math.floor(topicIndex / 4) + 1; // 4 topics per week
      const nodesInWeek = data.roadmap.topics.filter(t => 
        Math.floor(data.roadmap.topics.indexOf(t) / 4) + 1 === week
      ).length;
      maxNodesInWeek = Math.max(maxNodesInWeek, nodesInWeek);
      
      const yPosition = (topicIndex % 4) * 200; // Space topics vertically
      xPosition = (week - 1) * 300; // Space weeks horizontally
      
      // Add main topic node
      const nodeId = `node-${topic.id}`;
      nodes.push({
        id: nodeId,
        type: 'custom',
        data: {
          label: topic.title,
          topic: topic.title,
          timeEstimate: topic.timeEstimate,
          priority: topic.difficulty === 'advanced' ? 'High' : topic.difficulty === 'intermediate' ? 'Medium' : 'Low',
          completed: false,
          description: topic.description,
          resources: topic.subtopics.flatMap(st => st.resources)
        },
        position: { x: xPosition, y: yPosition },
        week
      });
      
      // Connect to previous topic if exists
      if (topicIndex > 0) {
        edges.push({
          id: `edge-${topic.id}`,
          source: `node-${data.roadmap.topics[topicIndex - 1].id}`,
          target: nodeId,
          type: 'smoothstep',
          animated: true
        });
      }
    });
    
    const roadmapData = {
      nodes,
      edges,
      totalWeeks: Math.ceil(data.roadmap.topics.length / 4),
      readinessScore: data.roadmap.readinessScore
    };

    // Save or update roadmap
    let roadmap = await Roadmap.findOne({ userId: user._id });
    
    if (roadmap) {
      roadmap.surveyData = {
        domain,
        targetCompany,
        expectedLPA,
        currentSkills
      };
      roadmap.nodes = roadmapData.nodes;
      roadmap.edges = roadmapData.edges;
      roadmap.totalWeeks = roadmapData.totalWeeks;
      roadmap.readinessScore = roadmapData.readinessScore;
      roadmap.progress = 0; // Reset progress for new roadmap
      roadmap.updatedAt = Date.now();
    } else {
      roadmap = new Roadmap({
        userId: user._id,
        surveyData: {
          domain,
          targetCompany,
          expectedLPA,
          currentSkills
        },
        nodes: roadmapData.nodes,
        edges: roadmapData.edges,
        totalWeeks: roadmapData.totalWeeks,
        readinessScore: roadmapData.readinessScore
      });
    }
    
    await roadmap.save();
    
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during roadmap generation'
    });
  }
};

// Get user's current roadmap with progress
exports.getUserRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found for this user'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...roadmap.toObject(),
        nextMilestones: await geminiService.getNextMilestones(roadmap)
      }
    });
  } catch (error) {
    console.error('Get user roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching roadmap'
    });
  }
};

// Update node completion status
exports.updateNodeProgress = async (req, res) => {
  try {
    const { nodeId, completed } = req.body;
    
    const roadmap = await Roadmap.findOne({ userId: req.user.id });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }
    
    // Find and update the node
    const node = roadmap.nodes.find(n => n.id === nodeId);
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }

    // Update node completion status
    node.data.completed = completed;

    // Save changes and recalculate progress
    roadmap.markModified('nodes');
    await roadmap.save();
    
    // Get updated recommendations
    const recommendations = await geminiService.getProgressRecommendations({
      nodes: roadmap.nodes,
      edges: roadmap.edges,
      progress: roadmap.progress,
      readinessScore: roadmap.readinessScore
    });

    res.json({
      success: true,
      data: {
        progress: roadmap.progress,
        readinessScore: roadmap.readinessScore,
        recommendations: recommendations.nextSteps
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during progress update'
    });
  }
};

// Update node positions
exports.updateNodePositions = async (req, res) => {
  try {
    const { nodes } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user.id });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Update node positions
    nodes.forEach(updatedNode => {
      const node = roadmap.nodes.find(n => n.id === updatedNode.id);
      if (node) {
        node.position = updatedNode.position;
      }
    });

    roadmap.markModified('nodes');
    await roadmap.save();

    res.json({
      success: true,
      message: 'Node positions updated successfully'
    });
  } catch (error) {
    console.error('Update node positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during position update'
    });
  }
};
