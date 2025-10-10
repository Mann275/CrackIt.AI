import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiFeather } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { Brain } from 'lucide-react';

const Home = ({ onShowAuth }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // SECURITY: Prevent Home component from rendering if user might be logged in
    const token = localStorage.getItem('token');
    if (token) {
      console.warn('Home component blocked - user appears to be logged in');
      setIsLoggedIn(true);
    }
  }, []);

  if (isLoggedIn) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 font-sans">
      {/* Logo */}
      <div className="absolute top-5 left-5 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="ml-2 font-bold text-xl text-slate-800">CrackIt<span className="text-orange-500">.AI</span></span>
        </motion.div>
      </div>
      
      {/* Sign in button */}
      <div className="absolute top-5 right-5 z-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button 
            onClick={() => onShowAuth('login')}
            className="px-5 py-2 rounded-lg font-medium bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transition-all duration-300 hover:shadow-lg flex items-center"
          >
            Sign In
          </button>
        </motion.div>
      </div>
      
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 max-w-4xl"
              variants={fadeIn}
            >
              Empower Your Future with <span className="text-orange-500">AI-Powered Placement Prep</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-10 text-slate-600 max-w-2xl"
              variants={fadeIn}
            >
              CrackIt.AI is your personalized placement guidance platform that helps you prepare for top companies with confidence.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              variants={fadeIn}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <button 
                  onClick={() => onShowAuth('register')}
                  className="px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-orange-500/50 flex items-center"
                >
                  Get Started
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight className="ml-2" />
                  </motion.div>
                </button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <button 
                  onClick={() => onShowAuth('features')}
                  className="px-8 py-4 rounded-xl font-medium border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-all duration-300 hover:shadow-lg flex items-center"
                >
                  Explore Features
                  <FiFeather className="ml-2" />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-800"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            About CrackIt.AI
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="p-8 rounded-xl bg-white shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-orange-500 text-4xl mb-4">
                <RiRobot2Line />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">AI-Powered Roadmaps</h3>
              <p className="text-slate-600">
                Our AI creates personalized study plans based on your skills, target companies, and preferred domains.
              </p>
            </motion.div>

            <motion.div 
              className="p-8 rounded-xl bg-white shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-orange-500 text-4xl mb-4">
                <FiFeather />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">AI Mock Tests</h3>
              <p className="text-slate-600">
                Get intelligent feedback on your mock test performance to improve your preparation strategy.
              </p>
            </motion.div>

            <motion.div 
              className="p-8 rounded-xl bg-white shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-orange-500 text-4xl mb-4">
                <FiArrowRight />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Progress Tracking</h3>
              <p className="text-slate-600">
                Track your learning journey with detailed analytics and progress indicators.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-5">Ready to Crack Your Dream Job?</h2>
            <p className="text-xl mb-10 text-white max-w-3xl mx-auto opacity-90">
              Join thousands of successful candidates who used CrackIt.AI to prepare for their interviews.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={() => onShowAuth('register')}
                className="px-10 py-5 rounded-xl font-medium text-lg bg-white text-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-700/30 inline-flex items-center"
              >
                Start Free Trial
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;