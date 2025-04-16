import axios from 'axios';

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_NOCODEBACKEND_API_URL;
const INSTANCE = import.meta.env.VITE_NOCODEBACKEND_INSTANCE;
const BEARER_TOKEN = import.meta.env.VITE_NOCODEBACKEND_BEARER_TOKEN;

// --- Axios Instance ---
// Create an instance to easily reuse base URL, headers, and params
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Automatically add the Instance query parameter to all requests
  params: {
    Instance: INSTANCE,
  }
});

// Hardcoded user ID for single-user operation (replace with dynamic user handling later)
const CURRENT_USER_ID = 1;

// --- API Service ---
const apiService = {

  // === Weight Entries ===

  getWeightEntries: async () => {
    try {
      // NoCodeBackend: GET /read/weight_entries - Need to filter by user_id
      // Using POST /search as GET /read doesn't seem to support filtering easily in docs
      const response = await apiClient.post(`/search/weight_entries`, {
        user_id: CURRENT_USER_ID // Filter criteria
      });
      // Assuming response structure is { status: "success", data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error("API Error fetching weight entries:", error.response?.data || error.message);
      throw error;
    }
  },

  addWeightEntry: async (entryData) => {
    try {
      // Format the current date/time as an ISO string suitable for DATETIME
      const nowISO = new Date().toISOString();
      const payload = {
        ...entryData,
        user_id: CURRENT_USER_ID,
        // *** ADD TIMESTAMPS ***
        created_at: nowISO,
        updated_at: nowISO, // Send on create as well
      };

      console.log("Attempting to add weight entry with payload:", JSON.stringify(payload, null, 2));
      const response = await apiClient.post(`/create/weight_entries`, payload);
      // Return data based on payload + ID, as API doesn't return full object
      return { ...entryData, id: response.data.id, created_at: nowISO, updated_at: nowISO };
    } catch (error) {
      console.error("API Error adding weight entry:", error.response?.data || error.message);
      if (error.response) { console.error("Error Details:", error.response); }
      throw error;
    }
  },

  updateWeightEntry: async (id, updateData) => { // updateData = { date?, weight? }
    try {
      // Ensure user_id is part of the update if needed, though it shouldn't change
      // const payload = { ...updateData, user_id: CURRENT_USER_ID }; // Usually not needed for update
      // NoCodeBackend: PUT /update/weight_entries/{id}
      // Note: PUT usually replaces the whole object. Ensure your backend/NoCodeBackend handles partial updates if you send only changed fields.
      const response = await apiClient.put(`/update/weight_entries/${id}`, updateData);
      // API likely doesn't return the full updated object.
      // Return the data sent for optimistic update.
      // If API returned updated data, use: return response.data.data;
      return { ...updateData, id }; // Combine ID with the update data
    } catch (error) {
      console.error("API Error updating weight entry:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteWeightEntry: async (id) => {
    try {
      // NoCodeBackend: DELETE /delete/weight_entries/{id}
      await apiClient.delete(`/delete/weight_entries/${id}`);
      // No content usually returned on success
    } catch (error) {
      console.error("API Error deleting weight entry:", error.response?.data || error.message);
      throw error;
    }
  },

  // === Goals ===
  // Assumes one goal record per user, linked via user_id

  getGoals: async () => {
    try {
      // NoCodeBackend: Need to find the user_goals record for CURRENT_USER_ID
      // Using POST /search/user_goals
      const response = await apiClient.post(`/search/user_goals`, {
        user_id: CURRENT_USER_ID // Find the goal record for our user
      });
      // Assuming response is { status, data: [{...}] } - take the first record found
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0]; // Return the full goal object including its own 'id'
      } else {
        console.warn(`Goals not found for user_id: ${CURRENT_USER_ID}, returning defaults.`);
        return null; // Or return a default goal structure if desired
      }
    } catch (error) {
       // Handle potential errors differently if needed (e.g., specific error codes)
       console.error("API Error fetching goals:", error.response?.data || error.message);
       throw error; // Re-throw error
    }
  },

  updateGoals: async (goalRecordId, goalData) => {
    if (!goalRecordId) {
        console.error("Cannot update goals without the goal record ID.");
        throw new Error("Goal record ID is missing for update.");
    }
    try {
       const payload = { ...goalData, user_id: CURRENT_USER_ID };

       // *** DEBUG LOGGING START ***
       console.log(`Attempting to update goals (ID: ${goalRecordId}) with payload:`, JSON.stringify(payload, null, 2));
       // *** DEBUG LOGGING END ***

       const response = await apiClient.put(`/update/user_goals/${goalRecordId}`, payload);
       return response.data.data || { ...payload, id: goalRecordId };
    } catch (error) {
      // *** DEBUG LOGGING START ***
       console.error("API Error updating goals:", error.response?.data || error.message);
        if (error.response) {
         console.error("Error Details:", error.response);
       }
      // *** DEBUG LOGGING END ***
       throw error;
    }
  },

  createInitialGoals: async (initialGoalData) => {
    try {
        const nowISO = new Date().toISOString();
        const payload = {
            ...initialGoalData,
            user_id: CURRENT_USER_ID,
            // *** ADD TIMESTAMPS ***
            created_at: nowISO,
            updated_at: nowISO, // Send on create as well
         };

        console.log("Attempting to create initial goals with payload:", JSON.stringify(payload, null, 2));
        const response = await apiClient.post(`/create/user_goals`, payload);
         // Return data based on payload + ID
        return { ...initialGoalData, id: response.data.id, created_at: nowISO, updated_at: nowISO };
    } catch (error) {
       console.error("API Error creating initial goals:", error.response?.data || error.message);
       if (error.response) { console.error("Error Details:", error.response); }
       throw error;
    }
}

// ... (rest of the service) ...


   // Add functions for 'additional_goals' CRUD here later if needed, following similar patterns.
   // Example:
   // getAdditionalGoals: async () => { ... apiClient.post(`/search/additional_goals`, { user_id: CURRENT_USER_ID }); ... }
   // addAdditionalGoal: async (goalData) => { ... apiClient.post(`/create/additional_goals`, { ...goalData, user_id: CURRENT_USER_ID }); ... }
   // updateAdditionalGoal: async (id, updateData) => { ... apiClient.put(`/update/additional_goals/${id}`, updateData); ... }
   // deleteAdditionalGoal: async (id) => { ... apiClient.delete(`/delete/additional_goals/${id}`); ... }

};

export default apiService;