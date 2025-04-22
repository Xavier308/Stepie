// apiService.js - Updated to include diet and workout tracking
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

// Default user ID - In a real app, this would come from authentication
const CURRENT_USER_ID = 1;

// --- API Service ---
const apiService = {
  // === Weight Entries ===
  getWeightEntries: async () => {
    try {
      const response = await apiClient.get(`/weight_entries`, {
        params: { user_id: CURRENT_USER_ID }
      });
      return response.data || [];
    } catch (error) {
      console.error("API Error fetching weight entries:", error.response?.data || error.message);
      // If the server is not available (e.g., during development), return an empty array
      if (error.code === 'ERR_NETWORK') {
        console.warn("Network error - server may not be running. Returning empty data.");
        return [];
      }
      throw error;
    }
  },

  addWeightEntry: async (entryData) => {
    try {
      const payload = {
        ...entryData,
        user_id: CURRENT_USER_ID
      };

      console.log("Adding weight entry:", JSON.stringify(payload, null, 2));
      const response = await apiClient.post(`/weight_entries`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error adding weight entry:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        // For development without a server, create a mock response
        console.warn("Network error - server may not be running. Creating mock entry.");
        return {
          id: Date.now(), // Use timestamp as mock ID
          user_id: CURRENT_USER_ID,
          weight: entryData.weight,
          date: entryData.date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
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

  // === Diet Entries ===
  getDietEntries: async (startDate, endDate) => {
    try {
      const params = { 
        user_id: CURRENT_USER_ID,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };
      
      const response = await apiClient.get(`/diet_entries`, { params });
      return response.data || [];
    } catch (error) {
      console.error("API Error fetching diet entries:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        console.warn("Network error - server may not be running. Returning empty data.");
        return [];
      }
      throw error;
    }
  },

  addDietEntry: async (entryData) => {
    try {
      const payload = {
        ...entryData,
        user_id: CURRENT_USER_ID
      };

      const response = await apiClient.post(`/diet_entries`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error adding diet entry:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        // For development without a server, create a mock response
        console.warn("Network error - server may not be running. Creating mock entry.");
        return {
          id: Date.now(),
          user_id: CURRENT_USER_ID,
          ...entryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },

  updateDietEntry: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/diet_entries/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("API Error updating diet entry:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteDietEntry: async (id) => {
    try {
      await apiClient.delete(`/diet_entries/${id}`);
    } catch (error) {
      console.error("API Error deleting diet entry:", error.response?.data || error.message);
      throw error;
    }
  },

  // === Workout Entries ===
  getWorkoutEntries: async (startDate, endDate) => {
    try {
      const params = { 
        user_id: CURRENT_USER_ID,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };
      
      const response = await apiClient.get(`/workout_entries`, { params });
      return response.data || [];
    } catch (error) {
      console.error("API Error fetching workout entries:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        console.warn("Network error - server may not be running. Returning empty data.");
        return [];
      }
      throw error;
    }
  },

  addWorkoutEntry: async (entryData) => {
    try {
      const payload = {
        ...entryData,
        user_id: CURRENT_USER_ID
      };

      const response = await apiClient.post(`/workout_entries`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error adding workout entry:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        // For development without a server, create a mock response
        console.warn("Network error - server may not be running. Creating mock entry.");
        return {
          id: Date.now(),
          user_id: CURRENT_USER_ID,
          ...entryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },

  updateWorkoutEntry: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/workout_entries/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("API Error updating workout entry:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteWorkoutEntry: async (id) => {
    try {
      await apiClient.delete(`/workout_entries/${id}`);
    } catch (error) {
      console.error("API Error deleting workout entry:", error.response?.data || error.message);
      throw error;
    }
  },

  // === Goals ===
  getGoals: async () => {
    try {
      const response = await apiClient.get(`/user_goals`, {
        params: { user_id: CURRENT_USER_ID }
      });
      return response.data || null;
    } catch (error) {
      console.error("API Error fetching goals:", error.response?.data || error.message);
      
      // If server is not available, return default goals
      if (error.code === 'ERR_NETWORK') {
        console.warn("Network error - server may not be running. Returning default goals.");
        return {
          id: 'default',
          user_id: CURRENT_USER_ID,
          targetWeight: null,
          stepSize: 5,
          weight_unit: 'lbs',
          additionalGoals: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  },

  updateGoals: async (goalRecordId, goalData) => {
    try {
      const payload = { 
        ...goalData, 
        user_id: CURRENT_USER_ID 
      };
      
      const response = await apiClient.post(`/user_goals`, payload);
      return response.data;
    } catch (error) {
      console.error("API Error updating goals:", error.response?.data || error.message);
      
      // If server is not available, return mock success
      if (error.code === 'ERR_NETWORK') {
        console.warn("Network error - server may not be running. Returning mock goal update.");
        return {
          id: goalRecordId || 'default',
          user_id: CURRENT_USER_ID,
          ...goalData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }
};

export default apiService;