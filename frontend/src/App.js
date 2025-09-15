import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Features from './pages/Features';
import Login from './pages/Login';
import Register from './pages/Register';
import GoalSetup from './pages/GoalSetup';
import SkillSurvey from './pages/SkillSurvey';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Roadmap from './pages/Roadmap';
import Chatroom from './pages/Chatroom';
import Checklist from './pages/Checklist';
import MockTests from './pages/MockTests';
import AuthAwareLayout from './components/AuthAwareLayout';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// First login route - redirects based on user's setup status
const FirstLoginRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.hasCompletedGoalSetup) {
    return <Navigate to="/goal-setup" />;
  }
  
  if (!user.hasCompletedSkillSurvey) {
    return <Navigate to="/skill-survey" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            {/* Custom Toast Container with Dark Theme */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: '#1f2937',
              color: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          />
          
          {/* Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route 
              path="/goal-setup" 
              element={
                <ProtectedRoute>
                  <GoalSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-survey" 
              element={
                <ProtectedRoute>
                  <SkillSurvey />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <FirstLoginRoute>
                  <Dashboard />
                </FirstLoginRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roadmap" 
              element={
                <ProtectedRoute>
                  <Roadmap />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chatroom />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checklist" 
              element={
                <ProtectedRoute>
                  <Checklist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mock-tests" 
              element={
                <ProtectedRoute>
                  <MockTests />
                </ProtectedRoute>
              } 
            />
          </Routes>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
