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
    required: true,
    min: 0,
    max: 100
  },
  answers: {
    type: Map,
    of: String // Maps question IDs to user answers
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

// Create index for faster lookups by user and test
TestResultSchema.index({ user: 1, test: 1 });

// Create index for sorting by score
TestResultSchema.index({ score: -1 });

// Virtual property to calculate performance metrics
TestResultSchema.virtual('performance').get(function() {
  const timePerQuestion = this.timeSpent / this.test.questions.length;
  const accuracy = this.score / 100;
  
  let performanceLevel = 'Low';
  if (accuracy >= 0.8) {
    performanceLevel = 'Excellent';
  } else if (accuracy >= 0.6) {
    performanceLevel = 'Good';
  } else if (accuracy >= 0.4) {
    performanceLevel = 'Average';
  }
  
  return {
    accuracy: Math.round(accuracy * 100) / 100,
    timePerQuestion: Math.round(timePerQuestion),
    performanceLevel
  };
});

// Method to get wrong answers
TestResultSchema.methods.getIncorrectAnswers = async function() {
  await this.populate('test');
  
  const incorrectAnswers = [];
  this.test.questions.forEach(question => {
    const userAnswer = this.answers.get(question._id.toString());
    if (userAnswer !== question.correctAnswer) {
      incorrectAnswers.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        topic: question.topic,
        explanation: question.explanation
      });
    }
  });
  
  return incorrectAnswers;
};

module.exports = mongoose.model('TestResult', TestResultSchema);
