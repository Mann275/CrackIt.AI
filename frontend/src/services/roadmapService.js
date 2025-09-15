import axios from 'axios';

const baseURL = '/api/roadmap';

export const roadmapService = {
  // Get user's current roadmap
  getRoadmap: async () => {
    try {
      const response = await axios.get(baseURL);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      throw error;
    }
  },

  // Generate new roadmap based on survey data
  generateRoadmap: async (surveyData) => {
    try {
      const response = await axios.post(`${baseURL}/generate`, {
        surveyData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  },

  // Update topic/subtopic progress
  updateProgress: async (progressData) => {
    try {
      const response = await axios.put(`${baseURL}/progress`, progressData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Mark a subtopic as completed or in-progress
  updateSubtopicStatus: async (topicId, subtopicId, status) => {
    try {
      const response = await axios.put(`${baseURL}/progress`, {
        topicId,
        subtopicId,
        status
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating subtopic status:', error);
      throw error;
    }
  }
};

export default roadmapService;