import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FiArrowRight, FiFeather } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

const Home = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const buttonHover = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Logo in top-left corner */}
      <div className="absolute top-5 left-5 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <RiRobot2Line className="text-white text-2xl" />
          </div>
          <span className="ml-2 font-bold text-xl text-white">CrackIt<span className="text-emerald-400">.AI</span></span>
        </motion.div>
      </div>
      
      {/* Sign in button in top-right corner */}
      <div className="absolute top-5 right-5 z-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link 
            to="/login" 
            className="px-5 py-2 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-all duration-300 hover:shadow-lg flex items-center"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
      
      {/* Hero Section - Simple and Clean */}
      <section className="py-0 md:py-0 bg-gray-900 text-white relative overflow-hidden h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzAgMHYzMGgzMHYzMGgtMzB2LTMwaC0zMFYwaDMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 text-white max-w-4xl"
              variants={fadeIn}
            >
              Empower Your Future with <span className="text-emerald-400">AI-Powered Placement Prep</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl"
              variants={fadeIn}
            >
              CrackIt.AI is your personalized placement guidance platform that helps you prepare for top companies with confidence.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              variants={fadeIn}
            >
              <motion.div
                variants={buttonHover}
                whileHover="hover"
                initial="rest"
              >
                <Link 
                  to="/register" 
                  className="px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 flex items-center"
                >
                  Get Started
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight className="ml-2" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                variants={buttonHover}
                whileHover="hover"
                initial="rest"
              >
                <Link 
                  to="/features" 
                  className="px-8 py-4 rounded-xl font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-all duration-300 hover:shadow-lg flex items-center"
                >
                  Explore Features
                  <FiFeather className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </section>

      {/* About CrackIt.AI Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8 text-center text-white"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            About CrackIt.AI
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="p-6 rounded-lg bg-gray-800 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-emerald-400 text-4xl mb-4">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">AI-Powered Roadmaps</h3>
              <p className="text-gray-300">
                Our AI creates personalized study plans based on your skills, target companies, and preferred domains.
              </p>
            </motion.div>
            <motion.div 
              className="p-6 rounded-lg bg-gray-800 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-indigo-400 text-4xl mb-4">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Mock Tests with AI Feedback</h3>
              <p className="text-gray-300">
                Company-specific mock interviews with intelligent AI feedback to prepare you for actual interviews.
              </p>
            </motion.div>
            <motion.div 
              className="p-6 rounded-lg bg-gray-800 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-purple-400 text-4xl mb-4">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Company-Wise Community Chat</h3>
              <p className="text-gray-300">
                Connect with peers targeting specific companies through dedicated chatrooms for company-focused preparation.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/features" 
              className="px-6 py-3 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-indigo-700/50"
            >
              Explore All Features
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Improved with Framer Motion */}
      <section className="py-20 overflow-hidden bg-gray-950 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-geometric.png')] opacity-5"></div>
        
        <motion.div 
          className="container mx-auto px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-3 text-center text-white"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Success Stories
          </motion.h2>
          
          <motion.p 
            className="text-center text-gray-400 mb-16 max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Hear from our alumni who landed their dream jobs using CrackIt.AI
          </motion.p>
          
          {/* Fixed grid layout for success stories (no carousel) */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
              {/* Testimonial 1 */}
              <motion.div 
                className="p-6 rounded-xl w-full h-[300px] bg-gray-800 border border-gray-700 shadow-lg flex flex-col backdrop-blur-sm bg-opacity-80"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.4)",
                  scale: 1.03,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4 flex items-center">
                  <div className="w-14 h-14 rounded-xl mr-4 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    PM
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Patel Mann</h4>
                    <p className="text-emerald-400 font-medium text-sm">Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4 flex-grow text-sm">
                  "CrackIt.AI's personalized roadmap helped me focus on exactly what I needed to learn for my interview. The mock tests were spot on!"
                </p>
                <div className="mt-auto">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Top Tech Company</span>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div 
                className="p-6 rounded-xl w-full h-[300px] bg-gray-800 border border-gray-700 shadow-lg flex flex-col backdrop-blur-sm bg-opacity-80"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.4)",
                  scale: 1.03,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="mb-4 flex items-center">
                  <div className="w-14 h-14 rounded-xl mr-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    PR
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Patel Rahul</h4>
                    <p className="text-indigo-400 font-medium text-sm">Data Scientist</p>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4 flex-grow text-sm">
                  "The company-specific QnA vault was invaluable. I was asked almost the same questions in my actual interview that I had practiced on CrackIt.AI."
                </p>
                <div className="mt-auto">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Leading Software Company</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Testimonial 3 */}
              <motion.div 
                className="p-6 rounded-xl w-full h-[300px] bg-gray-800 border border-gray-700 shadow-lg flex flex-col backdrop-blur-sm bg-opacity-80"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.4)",
                  scale: 1.03,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="mb-4 flex items-center">
                  <div className="w-14 h-14 rounded-xl mr-4 bg-gradient-to-br from-emerald-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    PS
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Patel Shivam</h4>
                    <p className="text-purple-400 font-medium text-sm">Backend Developer</p>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4 flex-grow text-sm">
                  "CrackIt.AI helped me identify my weak areas and focus on improving them. The AI roadmap was incredibly personalized and effective."
                </p>
                <div className="mt-auto">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Cloud Services Provider</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Testimonial 4 */}
              <motion.div 
                className="p-6 rounded-xl w-full h-[300px] bg-gray-800 border border-gray-700 shadow-lg flex flex-col backdrop-blur-sm bg-opacity-80"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.4)",
                  scale: 1.03,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="mb-4 flex items-center">
                  <div className="w-14 h-14 rounded-xl mr-4 bg-gradient-to-br from-indigo-500 to-purple-800 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    PD
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Patel Darsh</h4>
                    <p className="text-indigo-400 font-medium text-sm">Frontend Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4 flex-grow text-sm">
                  "The AI-generated mock tests were exactly what I needed to prepare for my technical interviews. I got hired within 3 months of using CrackIt.AI!"
                </p>
                <div className="mt-auto">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Global Tech Company</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section - with Framer Motion */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {/* 3D-like floating elements */}
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-indigo-500/10"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-purple-500/10"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Glowing accents */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-emerald-400"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-indigo-400"
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 3,
            delay: 0.5,
          }}
        ></motion.div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">Ready to Crack Your Dream Job?</h2>
            <p className="text-lg md:text-xl mb-10 text-gray-100 max-w-3xl mx-auto">
              Join thousands of successful candidates who used CrackIt.AI to prepare for their interviews and land their dream jobs.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to="/register" 
                className="px-10 py-5 rounded-xl font-medium text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 inline-flex items-center"
              >
                Start Free Trial
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Create a Features.js page later */}
    </div>
  );
};

export default Home;
