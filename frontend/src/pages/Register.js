import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiCheck, FiMoon, FiSun } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const { darkMode } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    // Check password strength criteria
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteria = [hasMinLength, hasUppercase, hasNumber, hasSymbol];
    const strengthScore = criteria.filter(Boolean).length;

    let message = '';
    let strength = '';

    if (password.length === 0) {
      message = '';
      strength = '';
    } else if (strengthScore === 4) {
      message = 'Strong password';
      strength = 'strong';
    } else if (strengthScore === 3) {
      message = 'Medium strength password';
      strength = 'medium';
    } else {
      message = 'Weak password';
      strength = 'weak';
    }

    setPasswordStrength(strength);
    setPasswordMessage(message);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      case 'weak':
        return 'w-1/3';
      default:
        return 'w-0';
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (passwordStrength === 'weak') {
      const errorMsg = 'Password is too weak. It must contain at least 8 characters including uppercase, numbers, and symbols.';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting registration form');
      const userData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful, redirecting to goal setup');
      toast.success('Account created successfully! Redirecting...');
      
      // Delay navigation for toast to be visible
      setTimeout(() => {
        navigate('/goal-setup');
      }, 1500);
    } catch (err) {
      console.error('Registration error in component:', err);
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzAgMHYzMGgzMHYzMGgtMzB2LTMwaC0zMFYwaDMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-900 opacity-20 blur-3xl"
        animate={{ 
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 15,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-emerald-900 opacity-20 blur-3xl"
        animate={{ 
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="max-w-xl w-full space-y-8 rounded-2xl shadow-2xl overflow-hidden relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Glassmorphism card */}
        <div className="backdrop-blur-lg bg-gray-800/70 border border-gray-700 p-8 rounded-2xl shadow-xl">
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <RiRobot2Line className="text-white text-3xl" />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-gray-300">
              Start your placement preparation journey with CrackIt.AI
            </p>
          </motion.div>
          
          {error && (
            <motion.div 
              variants={itemVariants}
              className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-200"
            >
              <p className="text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </motion.div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  placeholder="Patel Mann"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              {/* Enhanced Password strength meter with animations */}
              {formData.password && (
                <motion.div 
                  className="mt-3 bg-gray-800/80 p-3 rounded-lg border border-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      initial={{ width: '0%' }}
                      animate={{ width: getPasswordStrengthWidth() }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${
                    passwordStrength === 'strong' ? 'text-green-400' : 
                    passwordStrength === 'medium' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {passwordMessage}
                  </p>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{formData.password.length >= 8 ? <FiCheck /> : '•'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[A-Z]/.test(formData.password) ? <FiCheck /> : '•'}</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center text-xs ${/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[0-9]/.test(formData.password) ? <FiCheck /> : '•'}</span>
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className="mr-1">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? <FiCheck /> : '•'}</span>
                      <span>One special character</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              {formData.password && formData.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-1 text-sm flex items-center ${
                    formData.password === formData.confirmPassword 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}
                >
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <FiCheck className="mr-1" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <span>Passwords do not match</span>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                )}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
