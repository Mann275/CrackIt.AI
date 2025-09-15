const mongoose = require('mongoose');

const AIRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  interests: [{
    type: String
  }],
  timeCommitment: {
    type: String,
    required: true
  },
  roadmapData: {
    metadata: {
      title: String,
      description: String,
      totalDays: Number,
      themes: {
        light: {
          background: String,
          text: String,
          primary: String,
          secondary: String,
          accent: String,
          nodeBackground: String,
          nodeBorder: String,
          edgeColor: String
        },
        dark: {
          background: String,
          text: String,
          primary: String,
          secondary: String,
          accent: String,
          nodeBackground: String,
          nodeBorder: String,
          edgeColor: String
        }
      }
    },
    nodes: [{
      id: String,
      type: String,
      data: {
        label: String,
        description: String,
        content: String,
        exercises: [{
          title: String,
          description: String,
          difficulty: String,
          estimatedTime: String,
          link: String
        }],
        resources: [{
          title: String,
          url: String,
          type: String,
          description: String
        }],
        difficulty: String,
        estimatedHours: Number,
        weekEstimate: String,
        status: {
          type: String,
          enum: ['not-started', 'in-progress', 'completed'],
          default: 'not-started'
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      },
      position: {
        x: Number,
        y: Number
      }
    }],
    edges: [{
      id: String,
      source: String,
      target: String,
      data: {
        type: String
      }
    }]
  },
  parseError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Add index for faster queries by userId
AIRoadmapSchema.index({ userId: 1 });

// Add method to update node status
AIRoadmapSchema.methods.updateNodeStatus = async function(nodeId, status, progress) {
  const node = this.roadmapData.nodes.find(n => n.id === nodeId);
  if (node) {
    node.data.status = status;
    node.data.progress = progress;
    await this.save();
  }
};

// Add method to calculate overall progress
AIRoadmapSchema.methods.calculateProgress = function() {
  if (!this.roadmapData.nodes.length) return 0;
  
  const progress = this.roadmapData.nodes.reduce((acc, node) => {
    return acc + (node.data.progress || 0);
  }, 0);
  
  return Math.round(progress / this.roadmapData.nodes.length);
};

// Add method to get next recommended node
AIRoadmapSchema.methods.getNextRecommendedNode = function() {
  return this.roadmapData.nodes.find(node => 
    node.data.status === 'not-started' || 
    (node.data.status === 'in-progress' && node.data.progress < 100)
  );
};

module.exports = mongoose.model('AIRoadmap', AIRoadmapSchema);