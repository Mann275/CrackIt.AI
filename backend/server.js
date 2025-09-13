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
const testRoutes = require('./routes/testRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/crackit-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

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
app.use('/api/tests', testRoutes);

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
