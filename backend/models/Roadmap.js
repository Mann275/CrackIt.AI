const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // AI-generated checklist
  checklist: [
    {
      id: {
        type: String,
        required: true
      },
      task: {
        type: String,
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      category: {
        type: String,
        required: true
      }
    }
  ],
  // AI-generated readiness percentage
  readinessPercentage: {
    type: Number,
    default: 0
  },
  // AI-identified focus areas
  focusAreas: {
    type: [String],
    default: []
  },
  // AI-identified weak areas
  weakAreas: {
    type: [String],
    default: []
  },
  // AI-generated weekly study plan
  weeklyPlan: [
    {
      week: Number,
      theme: String,
      goals: [String]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
