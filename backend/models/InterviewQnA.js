const mongoose = require('mongoose');

const InterviewQnASchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'GeeksForGeeks'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
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

module.exports = mongoose.model('InterviewQnA', InterviewQnASchema);
