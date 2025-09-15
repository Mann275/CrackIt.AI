import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import RoadmapSurvey from '../components/roadmap/RoadmapSurvey';
import RoadmapFlow from '../components/roadmap/RoadmapFlow';
import { useAuth } from '../context/AuthContext';

const RoadmapPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);

  // Fetch existing roadmap on mount
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/roadmap/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setRoadmapData(data.data);
            setShowSurvey(false);
          }
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error);
      }
    };

    if (user) {
      fetchRoadmap();
    }
  }, [user]);

  const handleSurveySubmit = async (surveyData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(surveyData)
      });

      const data = await response.json();

      if (data.success) {
        setRoadmapData(data.data);
        setShowSurvey(false);
        toast.success('Roadmap generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load cached roadmap data from localStorage
  useEffect(() => {
    const cachedData = localStorage.getItem('cachedRoadmap');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setRoadmapData(parsed);
      setShowSurvey(false);
    }
  }, []);

  const handleNodeComplete = async (nodeId, completed) => {
    try {
      // Optimistically update the UI
      setRoadmapData(prevData => {
        const newData = {
          ...prevData,
          nodes: prevData.nodes.map(node => 
            node.id === nodeId 
              ? { ...node, data: { ...node.data, completed } }
              : node
          )
        };
        
        // Calculate new progress
        const totalNodes = newData.nodes.length;
        const completedCount = newData.nodes.filter(node => node.data.completed).length;
        newData.progress = Math.round((completedCount / totalNodes) * 100);

        // Cache the updated data
        localStorage.setItem('cachedRoadmap', JSON.stringify(newData));
        
        return newData;
      });

      // Update the server
      const response = await fetch(`http://localhost:5001/api/roadmap/${roadmapData._id}/node-progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nodeId, completed })
      });

      const data = await response.json();

      if (data.success) {
        // Update readiness score from server
        setRoadmapData(prevData => ({
          ...prevData,
          readinessScore: data.data.readinessScore
        }));

        // Show recommendations if provided
        if (data.data.recommendations?.length > 0) {
          toast.info(data.data.recommendations[0]);
        }
      } else {
        // Revert changes on error
        setRoadmapData(prevData => ({
          ...prevData,
          nodes: prevData.nodes.map(node => 
            node.id === nodeId 
              ? { ...node, data: { ...node.data, completed: !completed } }
              : node
          )
        }));
        toast.error(data.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert changes on error
      setRoadmapData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, completed: !completed } }
            : node
        )
      }));
      toast.error('Failed to update progress. Please try again.');
    }
  };

  const handleRestart = () => {
    // Clear cached data
    localStorage.removeItem('cachedRoadmap');
    setShowSurvey(true);
    setRoadmapData(null);
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Learning Roadmap</h1>
            <p className="text-gray-400 mt-2">
              Track your preparation progress and follow a personalized learning path.
            </p>
          </div>
          
          {!showSurvey && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Create New Roadmap
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showSurvey ? (
            <motion.div
              key="survey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RoadmapSurvey onSubmit={handleSurveySubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
            >
              {roadmapData && (
                <RoadmapFlow
                  roadmapData={roadmapData}
                  onNodeComplete={handleNodeComplete}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default RoadmapPage;