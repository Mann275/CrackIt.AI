const mongoose = require('mongoose');

const skillSurveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dsaTopics: [{
    name: String,
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  coreSubjects: [{
    name: String,
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  developmentExperience: [{
    area: String,
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    yearsOfExperience: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Validation for DSA topics
skillSurveySchema.path('dsaTopics').validate(function(topics) {
  const validTopics = [
    'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
    'Trees', 'Graphs', 'Dynamic Programming', 'Recursion',
    'Sorting', 'Searching', 'Hashing', 'Greedy'
  ];
  
  return topics.every(topic => validTopics.includes(topic.name));
}, 'Invalid DSA topic');

// Validation for core subjects
skillSurveySchema.path('coreSubjects').validate(function(subjects) {
  const validSubjects = [
    'Operating Systems', 'Database Management',
    'Computer Networks', 'System Design',
    'Object-Oriented Programming', 'Computer Architecture'
  ];
  
  return subjects.every(subject => validSubjects.includes(subject.name));
}, 'Invalid core subject');

// Validation for development areas
skillSurveySchema.path('developmentExperience').validate(function(experiences) {
  const validAreas = [
    'Web Development', 'Mobile Development',
    'Machine Learning', 'DevOps',
    'Cloud Computing', 'Data Science',
    'Backend Development', 'Frontend Development'
  ];
  
  return experiences.every(exp => validAreas.includes(exp.area));
}, 'Invalid development area');

module.exports = mongoose.model('SkillSurvey', skillSurveySchema);