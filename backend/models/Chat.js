const mongoose = require('mongoose');

const ChatroomSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatMessageSchema = new mongoose.Schema({
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Chatroom = mongoose.model('Chatroom', ChatroomSchema);
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = { Chatroom, ChatMessage };
