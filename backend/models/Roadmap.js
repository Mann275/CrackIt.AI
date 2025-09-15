const mongoose = require('mongoose');

// Node schema for React Flow
const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'custom' },
  data: {
    label: String,
    topic: String,
    timeEstimate: String,
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    },
    completed: { type: Boolean, default: false },
    description: String,
    resources: [{
      type: String,
      url: String,
      title: String
    }]
  },
  position: {
    x: Number,
    y: Number
  },
  week: Number
});

// Edge schema for React Flow
const EdgeSchema = new mongoose.Schema({
  id: String,
  source: String,
  target: String,
  type: {
    type: String,
    default: 'smoothstep'
  },
  animated: {
    type: Boolean,
    default: false
  }
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User's survey data
  surveyData: {
    domain: {
      type: String,
      required: true
    },
    targetCompany: {
      type: String,
      required: true
    },
    expectedLPA: {
      type: Number,
      required: true
    },
    currentSkills: [{
      name: String,
      confidenceLevel: Number
    }]
  },
  
  // React Flow nodes and edges
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  // Roadmap overview and metrics
  overview: {
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    focusAreas: [String],
    weakAreas: [String],
    estimatedTimeToCompletion: String
  },
  // Weekly learning plan
  weeklyPlan: [{
    week: Number,
    theme: String,
    goals: [String],
    topicsToFocus: [String],
    estimatedHours: Number
  }],
  // Progress tracking
  progress: {
    type: Number,
    default: 0
  },
  readinessScore: {
    type: Number,
    default: 0
  },
  totalWeeks: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update progress when nodes are modified
RoadmapSchema.methods.updateProgress = function() {
  if (!this.nodes || this.nodes.length === 0) {
    this.progress = 0;
    return;
  }
  
  const completedNodes = this.nodes.filter(node => node.data.completed).length;
  this.progress = Math.round((completedNodes / this.nodes.length) * 100);
};

// Pre-save middleware to update timestamps and progress
RoadmapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.updateProgress();
  next();
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
