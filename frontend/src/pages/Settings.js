import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const Settings = () => {
  const navigate = useNavigate();
  const { colors, darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Implementation here
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold mb-8 flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <span>Account Settings</span>
          <span role="img" aria-label="settings">⚙️</span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile and Security Settings */}
          <motion.div variants={itemVariants} className="md:col-span-8 space-y-6">
            {/* Profile Settings */}
            <div
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Roadmap Settings</span>
                <span role="img" aria-label="profile">🗺️</span>
              </h2>
              
              <div className="space-y-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/skill-survey')}
                  className="w-full p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  <span className="flex items-center gap-2">
                    <span>Update Skill Survey</span>
                    <span role="img" aria-label="survey">📝</span>
                  </span>
                  <ChevronRightIcon className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/goal-setup')}
                  className="w-full p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  <span className="flex items-center gap-2">
                    <span>Goal Setup</span>
                    <span role="img" aria-label="goal">🎯</span>
                  </span>
                  <ChevronRightIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Profile Settings</span>
                <span role="img" aria-label="profile">👤</span>
              </h2>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute -bottom-2 -right-2 p-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <span role="img" aria-label="camera">📸</span>
                  </motion.button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>
                    {user?.name}
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Display Name 📛
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full p-2 rounded-lg"
                    style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-2 mt-4 rounded-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: colors.background }}
                >
                  <span>Save Profile Changes</span>
                  <span role="img" aria-label="save">💾</span>
                </motion.button>
              </div>
            </div>

            {/* Security Settings */}
            <div
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Security</span>
                <span role="img" aria-label="security">🔒</span>
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Current Password 🔑
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-2 rounded-lg"
                    style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    New Password 🆕
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-2 rounded-lg"
                    style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Confirm Password ✅
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-2 rounded-lg"
                    style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full p-2 rounded-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: colors.background }}
                >
                  <span>Update Password</span>
                  <span role="img" aria-label="key">🔐</span>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Preferences Column */}
          <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
            {/* Theme Settings */}
            <div
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Appearance</span>
                <span role="img" aria-label="theme">✨</span>
              </h2>

              <button
                onClick={toggleTheme}
                className="w-full p-4 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <span style={{ color: colors.text }} className="flex items-center gap-2">
                  <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  <span role="img" aria-label="mode">{darkMode ? '🌙' : '☀️'}</span>
                </span>
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: darkMode ? colors.primary : colors.background,
                    justifyContent: darkMode ? 'flex-end' : 'flex-start'
                  }}
                  className="w-12 h-6 rounded-full p-1 flex"
                  style={{ border: `1px solid ${colors.border}` }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: darkMode ? colors.background : colors.primary }}
                  />
                </motion.div>
              </button>
            </div>

            {/* Sign Out */}
            <div
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Sign Out</span>
                <span role="img" aria-label="sign-out">🚪</span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    await logout();
                    setShowLogoutMessage(true);
                    setTimeout(() => {
                      navigate('/login');
                    }, 1500);
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
                className="w-full p-4 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: '#ef4444' }}
              >
                <span className="flex items-center gap-2">
                  <span>Sign Out</span>
                  <span role="img" aria-label="sign-out">🔓</span>
                </span>
              </motion.button>
              {showLogoutMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-2 rounded text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <span style={{ color: colors.text }}>Signing out...</span>
                </motion.div>
              )}
            </div>

            {/* Notification Settings */}
            <div
              className="rounded-xl shadow-md p-6"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.text }}>
                <span>Notifications</span>
                <span role="img" aria-label="notifications">🔔</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text }} className="flex items-center gap-2">
                    <span>Push Notifications</span>
                    <span role="img" aria-label="mobile">📱</span>
                  </span>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: notificationsEnabled ? colors.primary : colors.background,
                      justifyContent: notificationsEnabled ? 'flex-end' : 'flex-start'
                    }}
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="w-12 h-6 rounded-full p-1 flex cursor-pointer"
                    style={{ border: `1px solid ${colors.border}` }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: notificationsEnabled ? colors.background : colors.primary }}
                    />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text }} className="flex items-center gap-2">
                    <span>Email Updates</span>
                    <span role="img" aria-label="email">📧</span>
                  </span>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: emailNotifications ? colors.primary : colors.background,
                      justifyContent: emailNotifications ? 'flex-end' : 'flex-start'
                    }}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className="w-12 h-6 rounded-full p-1 flex cursor-pointer"
                    style={{ border: `1px solid ${colors.border}` }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: emailNotifications ? colors.background : colors.primary }}
                    />
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-2 mt-4 rounded-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: colors.background }}
                >
                  <span>Save Preferences</span>
                  <span role="img" aria-label="save">💾</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;