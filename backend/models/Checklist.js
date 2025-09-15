const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Technical', 'Soft Skills', 'Projects', 'Documentation'],
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  dueDate: Date,
  completedAt: Date,
  notes: String,
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChecklistItem'
  }],
  linkedRoadmapTopic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap.topics'
  }
});

const checklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    enum: ['Web Development', 'App Development', 'DSA', 'Machine Learning'],
    required: true
  },
  progress: {
    total: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  items: [checklistItemSchema]
}, {
  timestamps: true
});

// Update progress whenever an item is modified
checklistSchema.methods.updateProgress = async function() {
  const total = this.items.length;
  const completed = this.items.filter(item => item.status === 'Completed').length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  this.progress = {
    total,
    completed,
    percentage
  };
  
  await this.save();
  return this.progress;
};

// Update item status
checklistSchema.methods.updateItemStatus = async function(itemId, status) {
  const item = this.items.id(itemId);
  if (!item) throw new Error('Checklist item not found');
  
  item.status = status;
  if (status === 'Completed') {
    item.completedAt = new Date();
  } else {
    item.completedAt = null;
  }
  
  await this.save();
  await this.updateProgress();
  
  return item;
};

const Checklist = mongoose.model('Checklist', checklistSchema);
module.exports = Checklist;