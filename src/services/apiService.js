import axios from 'axios';

// --- Configuration ---
// Use environment variable in production or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// --- Axios Instance ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Hardcoded user ID for single-user operation (replace with dynamic user handling later)
const CURRENT_USER_ID = 1;

// --- API Service ---
const apiService = {

  // === Weight Entries ===

  getWeightEntries: async () => {
    try {
      // Get weight entries for the current user
      const response = await apiClient.get(`/weight_entries`, {
        params: { user_id: CURRENT_USER_ID }
      });
      return response.data || [];
    } catch (error) {
      console.error("API Error fetching weight entries:", error.response?.data || error.message);
      throw error;
    }
  },

  addWeightEntry: async (entryData) => {
    try {
      const payload = {
        ...entryData,
        user_id: CURRENT_USER_ID
      };

      console.log("Attempting to add weight entry with payload:", JSON.stringify(payload, null, 2));
      const response = await apiClient.post(`/weight_entries`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error adding weight entry:", error.response?.data || error.message);
      if (error.response) { console.error("Error Details:", error.response); }
      throw error;
    }
  },

  updateWeightEntry: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/weight_entries/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("API Error updating weight entry:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteWeightEntry: async (id) => {
    try {
      await apiClient.delete(`/weight_entries/${id}`);
      // No content usually returned on success
    } catch (error) {
      console.error("API Error deleting weight entry:", error.response?.data || error.message);
      throw error;
    }
  },

  // === Goals ===

  getGoals: async () => {
    try {
      const response = await apiClient.get(`/user_goals`, {
        params: { user_id: CURRENT_USER_ID }
      });
      return response.data; // Will be null if no goals found
    } catch (error) {
       console.error("API Error fetching goals:", error.response?.data || error.message);
       throw error;
    }
  },

  updateGoals: async (goalRecordId, goalData) => {
    try {
      const payload = { 
        ...goalData, 
        user_id: CURRENT_USER_ID 
      };

      console.log(`Attempting to update goals with payload:`, JSON.stringify(payload, null, 2));
      
      // In our SQLite implementation, we use POST for both create and update
      const response = await apiClient.post(`/user_goals`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error updating goals:", error.response?.data || error.message);
      if (error.response) {
        console.error("Error Details:", error.response);
      }
      throw error;
    }
  },

  createInitialGoals: async (initialGoalData) => {
    try {
        const payload = {
            ...initialGoalData,
            user_id: CURRENT_USER_ID
        };

        console.log("Attempting to create initial goals with payload:", JSON.stringify(payload, null, 2));
        
        // Same endpoint as updateGoals since our SQLite implementation handles both create and update
        const response = await apiClient.post(`/user_goals`, payload);
        return response.data;
    } catch (error) {
       console.error("API Error creating initial goals:", error.response?.data || error.message);
       if (error.response) { console.error("Error Details:", error.response); }
       throw error;
    }
  }
};

export default apiService;