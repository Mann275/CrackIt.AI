const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const aiRoadmapRoutes = require('./routes/aiRoadmapRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const goalRoutes = require('./routes/goalRoutes');
const skillSurveyRoutes = require('./routes/skillSurveyRoutes');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate Entry Error',
        error: 'A resource with these details already exists'
      });
    }
  }

  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication Error',
      error: 'Invalid or expired token'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Database Connection
mongoose.set('strictQuery', false); // Add this line to handle the deprecation warning
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/crackit-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to CrackIt.AI Backend');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleTimeString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/roadmap/ai', aiRoadmapRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/survey', skillSurveyRoutes);

// Socket.io connection for chat
const { Chatroom, ChatMessage } = require('./models/Chat');
const User = require('./models/User');

// Track active users in chatrooms
const activeUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join chatroom
  socket.on('joinRoom', async ({ userId, chatroomId }) => {
    try {
      // Fetch user data
      const user = await User.findById(userId).select('name');
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      // Add user to room
      socket.join(chatroomId);
      
      // Update active users count
      if (!activeUsers[chatroomId]) {
        activeUsers[chatroomId] = new Set();
      }
      activeUsers[chatroomId].add(userId);
      
      // Update chatroom active users count
      await Chatroom.findByIdAndUpdate(chatroomId, {
        activeUsers: activeUsers[chatroomId].size
      });
      
      // Fetch recent messages
      const messages = await ChatMessage.find({ chatroomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('userId', 'name');
      
      // Send message history to the user
      socket.emit('messageHistory', { messages: messages.reverse() });
      
      // Notify room that user has joined
      socket.to(chatroomId).emit('userJoined', {
        userId,
        userName: user.name
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join chatroom' });
    }
  });
  
  // New message
  socket.on('sendMessage', async ({ userId, chatroomId, message }) => {
    try {
      // Fetch user data
      const user = await User.findById(userId).select('name');
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      // Create new message
      const newMessage = new ChatMessage({
        chatroomId,
        userId,
        userName: user.name,
        message
      });
      
      await newMessage.save();
      
      // Broadcast message to room
      io.to(chatroomId).emit('newMessage', {
        _id: newMessage._id,
        userId,
        userName: user.name,
        message,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Leave chatroom
  socket.on('leaveRoom', async ({ userId, chatroomId }) => {
    try {
      // Remove user from room
      socket.leave(chatroomId);
      
      // Update active users count
      if (activeUsers[chatroomId]) {
        activeUsers[chatroomId].delete(userId);
        
        // Update chatroom active users count
        await Chatroom.findByIdAndUpdate(chatroomId, {
          activeUsers: activeUsers[chatroomId].size
        });
        
        // Notify room that user has left
        socket.to(chatroomId).emit('userLeft', { userId });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // In a production app, would need to handle removing the user from all rooms
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
