import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const Chatroom = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Google', icon: '🎯' },
    { id: 2, name: 'Microsoft', icon: '🪟' },
    { id: 3, name: 'Amazon', icon: '📦' },
    { id: 4, name: 'Meta', icon: '👥' },
    { id: 5, name: 'Apple', icon: '🍎' },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: user.name,
      timestamp: new Date(),
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}`
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Chat Rooms List */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 space-y-4"
          >
            <div
              className="rounded-xl shadow-md p-4"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
                Company Chatrooms
              </h2>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <motion.button
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRoom(room)}
                    className="w-full p-3 rounded-lg flex items-center space-x-3"
                    style={{
                      backgroundColor: selectedRoom?.id === room.id ? colors.primary + '20' : colors.surface,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <span className="text-2xl">{room.icon}</span>
                    <span style={{ color: colors.text }}>{room.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-9"
          >
            {selectedRoom ? (
              <div
                className="rounded-xl shadow-md h-[calc(100vh-12rem)] flex flex-col"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              >
                {/* Chat Header */}
                <div
                  className="p-4 border-b flex items-center space-x-3"
                  style={{ borderColor: colors.border }}
                >
                  <span className="text-2xl">{selectedRoom.icon}</span>
                  <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                    {selectedRoom.name} Discussion Room
                  </h2>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === user.name ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex ${message.sender === user.name ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}
                      >
                        <img
                          src={message.avatar}
                          alt={message.sender}
                          className="w-8 h-8 rounded-full"
                        />
                        <div
                          className="max-w-md rounded-lg p-3"
                          style={{
                            backgroundColor: message.sender === user.name ? colors.primary + '20' : colors.surface,
                            color: colors.text
                          }}
                        >
                          <p className="text-sm font-medium mb-1">{message.sender}</p>
                          <p>{message.text}</p>
                          <p className="text-xs mt-1 opacity-60">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: colors.border }}>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 rounded-lg"
                      style={{
                        backgroundColor: colors.surface,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-6 py-2 rounded-lg"
                      style={{ backgroundColor: colors.primary, color: colors.background }}
                    >
                      Send 📤
                    </motion.button>
                  </div>
                </form>
              </div>
            ) : (
              <div
                className="rounded-xl shadow-md p-6 flex flex-col items-center justify-center h-[calc(100vh-12rem)]"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              >
                <span className="text-6xl mb-4">💭</span>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                  Select a Chatroom
                </h3>
                <p style={{ color: colors.text }}>
                  Choose a company chatroom to start discussing interview experiences
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Chatroom;