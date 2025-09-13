const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: {
    type: Map,
    of: String
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  // AI-generated analysis
  aiAnalysis: {
    accuracyPercentage: {
      type: Number
    },
    weakAreas: [String],
    suggestedNextSteps: [String],
    readinessScore: {
      type: Number
    },
    feedbackSummary: {
      type: String
    }
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestResult', TestResultSchema);
