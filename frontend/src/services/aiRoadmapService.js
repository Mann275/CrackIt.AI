import api from './api';

const aiRoadmapService = {
    // Generate roadmap using AI
    generateRoadmap: async (data) => {
        try {
            const response = await api.post('/roadmap/ai/generate', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error generating roadmap');
        }
    },

    // Get current AI roadmap
    getRoadmap: async () => {
        try {
            const response = await api.get('/roadmap/ai');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching roadmap');
        }
    },

    // Update node progress
    updateProgress: async (nodeId, status, progress) => {
        try {
            const response = await api.patch('/roadmap/ai/progress', {
                nodeId,
                status,
                progress
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating progress');
        }
    }
};

export default aiRoadmapService;