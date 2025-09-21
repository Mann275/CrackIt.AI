import React from 'react';
import { motion } from 'framer-motion';
import { RiRoadMapLine, RiQuestionAnswerLine, RiTeamLine } from 'react-icons/ri';
import { FiArrowLeft } from 'react-icons/fi';
import { BsRobot, BsClipboardCheck } from 'react-icons/bs';

const Features = ({ onBack, onShowAuth }) => {
  // SECURITY: Prevent Features component from rendering if user might be logged in
  const token = localStorage.getItem('token');
  if (token) {
    console.warn('Features component blocked - user appears to be logged in');
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      id: 1,
      title: "Personalized Roadmap Generator",
      description: "Our AI analyzes your skills and goals to create a custom study plan, prioritizing what you need to learn for your target companies. Update progress as you go, and the roadmap adapts.",
      icon: <RiRoadMapLine className="text-5xl text-indigo-400" />,
      color: "from-indigo-500 to-indigo-700"
    },
    {
      id: 2,
      title: "Mock Tests with AI Feedback",
      description: "Practice with company-specific questions. Our AI analyzes your responses, highlights strengths and weaknesses, and recommends focused study areas to improve your performance.",
      icon: <BsRobot className="text-5xl text-emerald-400" />,
      color: "from-emerald-500 to-emerald-700"
    },
    {
      id: 3,
      title: "Checklist & Progress Tracker",
      description: "Striver-sheet style checklist with categories for algorithms, data structures, system design, and more. Track your progress and see your improvements over time.",
      icon: <BsClipboardCheck className="text-5xl text-purple-400" />,
      color: "from-purple-500 to-purple-700"
    },
    {
      id: 4,
      title: "Company Chatrooms",
      description: "Connect with peers targeting the same companies. Share insights, discuss strategies, and help each other prepare through real-time chatrooms powered by Socket.io.",
      icon: <RiTeamLine className="text-5xl text-blue-400" />,
      color: "from-blue-500 to-blue-700"
    },
    {
      id: 5,
      title: "Skills Assessment",
      description: "Take comprehensive skill assessments to understand your current level. Get detailed feedback and personalized recommendations to improve your technical abilities.",
      icon: <RiQuestionAnswerLine className="text-5xl text-amber-400" />,
      color: "from-amber-500 to-amber-700"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black py-16">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center text-orange-500 hover:text-orange-600 mb-8 group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Features <span className="text-orange-500">& Capabilities</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how CrackIt.AI helps you prepare for placements with personalized tools and AI-powered guidance.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={itemVariants}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300"
            >
              <div className={`relative h-48 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                <div className="text-white text-6xl opacity-20 absolute">
                  {feature.icon}
                </div>
                <div className="text-white text-4xl z-10">
                  {feature.icon}
                </div>
              </div>
              
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              <div className="p-6 pt-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg bg-gradient-to-r ${feature.color} text-white w-full font-medium transition-all duration-300`}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to start your journey?</h3>
              <p className="text-orange-100 max-w-xl">
                Join CrackIt.AI today and get access to all these powerful features to help you land your dream job.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <button 
                onClick={() => onShowAuth('register')}
                className="px-8 py-4 rounded-xl bg-white text-orange-500 font-medium shadow-lg hover:shadow-white/30 transition-all duration-300"
              >
                Get Started for Free
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;