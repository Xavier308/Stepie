import React, { useState, useEffect } from 'react';
import WeightTracker from './components/WeightTracker';
import GoalManager from './components/GoalManager';
import apiService from './services/apiService';
import './index.css'; // Ensure your CSS is imported

function App() {
  // State for data
  const [weightEntries, setWeightEntries] = useState([]);
  const [goals, setGoals] = useState({
    // Default structure, gets overwritten/merged on fetch
    targetWeight: null,
    stepSize: 5,
    weight_unit: 'lbs', // Default unit, sync with user_goals table default
    // additionalGoals: [], // Placeholder for future feature
    // Note: The API returns the 'id' of the user_goals record itself too
  });
  const [goalRecordId, setGoalRecordId] = useState(null); // Stores the ID of the user_goals row

  // State for UI feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weight entries first (or concurrently if independent)
      const fetchedWeightData = await apiService.getWeightEntries();
      // Sort fetched entries by date for consistency
      setWeightEntries(fetchedWeightData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date)) || []);

      // Fetch goal data for the current user
      const fetchedGoalData = await apiService.getGoals(); // This now returns the full goal object OR null

      if (fetchedGoalData) {
        // If goals exist, update state and store the goal record's ID
        setGoals(prevGoals => ({
          ...prevGoals,        // Keep any frontend-only defaults if needed
          ...fetchedGoalData   // Overwrite with fetched data (targetWeight, stepSize, weight_unit, id, etc.)
        }));
        setGoalRecordId(fetchedGoalData.id); // Store the ID of the user_goals table row
        console.log("Fetched Goals:", fetchedGoalData);
      } else {
        // Handle case where goals don't exist yet for the user
        console.log("No existing goals found for user. Using defaults.");
        // Keep the default `goals` state and ensure goalRecordId is null
        setGoalRecordId(null);
      }

    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      // Provide a more specific error message if possible
      const errorMsg = err.response?.data?.message || err.message || "Could not load data.";
      setError(`Failed to load data: ${errorMsg} Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means run once on mount

  // --- CRUD Handlers ---

  // Weight Entries Handlers
  const handleAddWeightEntry = async (newEntry) => {
    try {
      setError(null); // Clear previous errors
      const addedEntry = await apiService.addWeightEntry(newEntry); // API returns { ...newEntry, id }
      // Add the new entry returned by the API and re-sort
      setWeightEntries(prev => [...prev, addedEntry].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date)));
    } catch (err) {
      console.error("Failed to add weight entry:", err);
      setError("Could not save weight entry.");
    }
  };

  const handleUpdateWeightEntry = async (id, updatedData) => {
    try {
      setError(null);
      // API returns { ...updatedData, id } optimistically
      const updatedEntryFromApi = await apiService.updateWeightEntry(id, updatedData);
      setWeightEntries(prev =>
        prev.map(entry => (entry.id === id ? { ...entry, ...updatedEntryFromApi } : entry)) // Merge updates
         .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date)) // Maintain sort order
      );
    } catch (err) {
      console.error("Failed to update weight entry:", err);
      setError("Could not update weight entry.");
    }
  };

  const handleDeleteWeightEntry = async (id) => {
    try {
      setError(null);
      await apiService.deleteWeightEntry(id);
      setWeightEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error("Failed to delete weight entry:", err);
      setError("Could not delete weight entry.");
    }
  };

  // Goal Handler (Handles both Create and Update)
  const handleUpdateGoals = async (goalFormData) => {
    // Prepare payload - ensure targetWeight is null if empty string, etc.
    const payload = {
      targetWeight: goalFormData.targetWeight === '' ? null : parseFloat(goalFormData.targetWeight),
      stepSize: parseInt(goalFormData.stepSize, 10) || 5,
      weight_unit: goals.weight_unit || 'lbs' // Include unit, potentially make it editable later
    };

    try {
      setError(null);
      let updatedGoalsResponse;

      if (goalRecordId) {
        // --- If goals record exists, update it ---
        console.log(`Updating goals record ID: ${goalRecordId}`);
        updatedGoalsResponse = await apiService.updateGoals(goalRecordId, payload); // Pass the record ID
      } else {
        // --- If goals record doesn't exist, create it ---
        console.log("No existing goal record found, creating initial goals record...");
        updatedGoalsResponse = await apiService.createInitialGoals(payload);
        setGoalRecordId(updatedGoalsResponse.id); // Store the new record ID
        console.log("Created new goals record with ID:", updatedGoalsResponse.id);
      }

      // Update local state with the latest data (returned from API or merged)
      setGoals(prevGoals => ({ ...prevGoals, ...updatedGoalsResponse }));
      console.log("Goals state updated:", { ...goals, ...updatedGoalsResponse });

    } catch (err) {
      console.error("Failed to update/create goals:", err);
      setError("Could not save goals.");
    }
  };

  // --- Render Logic ---
  return (
    <div className="container"> {/* Use basic container class */}
      <header className="text-center mb-8">
        {/* Using basic styles from index.css */}
        <h1>Stepie</h1>
        <p className="text-lg text-gray-600">Track your weight journey, one step at a time.</p>
      </header>

      {/* Loading Indicator */}
      {loading && <p className="text-center" style={{color: 'blue', fontSize: '1.2em', padding: '20px'}}>Loading your data...</p>}

      {/* Error Display */}
      {error && (
          <p
             className="text-center"
             style={{
                color: '#721c24', // Dark red text
                backgroundColor: '#f8d7da', // Light red background
                border: '1px solid #f5c6cb', // Reddish border
                padding: '15px',
                borderRadius: '5px',
                margin: '20px 0'
             }}
           >
              <strong>Error:</strong> {error}
          </p>
      )}

      {/* Main Content Area (only render when not loading and no initial fetch error) */}
      {!loading && !error && (
        <main className="space-y-8"> {/* Basic spacing utility */}
          <GoalManager
            // Pass only the necessary goal fields the component uses
            goals={{
                targetWeight: goals.targetWeight,
                stepSize: goals.stepSize,
                // Pass additionalGoals later when implemented
            }}
            onUpdateGoals={handleUpdateGoals} // This now handles create/update
          />
          <WeightTracker
            weightEntries={weightEntries}
            targetWeight={goals.targetWeight}
            stepSize={goals.stepSize}
            weightUnit={goals.weight_unit} // Pass unit for display
            onAddEntry={handleAddWeightEntry}
            onUpdateEntry={handleUpdateWeightEntry}
            onDeleteEntry={handleDeleteWeightEntry}
          />
          {/* Placeholder for AdditionalGoals component */}
          {/* <AdditionalGoalsManager /> */}
        </main>
      )}

      {/* Footer outside the main conditional rendering */}
      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>Stepie App</p>
         {/* Optional: Add version or link */}
      </footer>
    </div>
  );
}

export default App;