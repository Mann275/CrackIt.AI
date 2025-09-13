const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  targetCompanies: {
    type: [String],
    default: []
  },
  preferredDomain: {
    type: String,
    default: ''
  },
  techStack: {
    type: [String],
    default: []
  },
  expectedLPA: {
    type: Number,
    default: 0
  },
  skills: {
    dsaSkills: {
      arrays: { type: Number, default: 1 },
      linkedLists: { type: Number, default: 1 },
      stacks: { type: Number, default: 1 },
      queues: { type: Number, default: 1 },
      trees: { type: Number, default: 1 },
      graphs: { type: Number, default: 1 },
      dp: { type: Number, default: 1 },
      recursion: { type: Number, default: 1 },
      searching: { type: Number, default: 1 },
      sorting: { type: Number, default: 1 }
    },
    coreCSSkills: {
      dbms: { type: Number, default: 1 },
      os: { type: Number, default: 1 },
      cn: { type: Number, default: 1 },
      oops: { type: Number, default: 1 }
    },
    devExperience: {
      web: { type: Number, default: 1 },
      app: { type: Number, default: 1 },
      ml: { type: Number, default: 1 },
      cloud: { type: Number, default: 1 }
    }
  },
  hasCompletedGoalSetup: {
    type: Boolean,
    default: false
  },
  hasCompletedSkillSurvey: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
