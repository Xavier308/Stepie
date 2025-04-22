// App.jsx with proper database initialization and new features
import React, { useState, useEffect } from 'react';
import WeightChart from './components/WeightChart';
import ActivityHeatmap from './components/ActivityHeatmap';
import AddEntryModal from './components/AddEntryModal';
import apiService from './services/apiService';
import InitialSetupFlow from './components/InitialSetupFlow';
import './index.css'; 

function App() {
  // State for data
  const [weightEntries, setWeightEntries] = useState([]);
  const [dietEntries, setDietEntries] = useState([]);
  const [workoutEntries, setWorkoutEntries] = useState([]);
  const [goals, setGoals] = useState({
    targetWeight: null,
    stepSize: 5,
    weight_unit: 'lbs',
  });
  const [goalRecordId, setGoalRecordId] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Show success message with auto-hide
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weight entries
      const fetchedWeightData = await apiService.getWeightEntries();
      setWeightEntries(fetchedWeightData.sort((a, b) => new Date(a.date) - new Date(b.date)) || []);

      // Fetch diet entries
      const fetchedDietData = await apiService.getDietEntries();
      setDietEntries(fetchedDietData || []);

      // Fetch workout entries
      const fetchedWorkoutData = await apiService.getWorkoutEntries();
      setWorkoutEntries(fetchedWorkoutData || []);

      // Fetch goal data
      const fetchedGoalData = await apiService.getGoals();
      if (fetchedGoalData) {
        setGoals(prevGoals => ({
          ...prevGoals,
          ...fetchedGoalData
        }));
        setGoalRecordId(fetchedGoalData.id);
      }
      
      // Check if we need initial setup
      // Consider setup needed if there are no weight entries
      if (fetchedWeightData.length === 0) {
        setNeedsInitialSetup(true);
      }
      
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Could not load data.";
      setError(`Failed to load data: ${errorMsg} Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Entry handlers
  const handleAddWeightEntry = async (weightData) => {
    try {
      setError(null);
      const addedEntry = await apiService.addWeightEntry(weightData);
      setWeightEntries(prev => [...prev, addedEntry].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAddModal(false);
      setShowSuccessMessage('Weight entry added successfully!');
    } catch (err) {
      console.error("Failed to add weight entry:", err);
      setError("Could not save weight entry.");
    }
  };

  const handleAddDietEntry = async (dietData) => {
    try {
      setError(null);
      const addedEntry = await apiService.addDietEntry(dietData);
      setDietEntries(prev => [...prev, addedEntry]);
      setShowAddModal(false);
      setShowSuccessMessage('Diet entry added successfully!');
    } catch (err) {
      console.error("Failed to add diet entry:", err);
      setError("Could not save diet entry.");
    }
  };

  const handleAddWorkoutEntry = async (workoutData) => {
    try {
      setError(null);
      const addedEntry = await apiService.addWorkoutEntry(workoutData);
      setWorkoutEntries(prev => [...prev, addedEntry]);
      setShowAddModal(false);
      setShowSuccessMessage('Workout entry added successfully!');
    } catch (err) {
      console.error("Failed to add workout entry:", err);
      setError("Could not save workout entry.");
    }
  };

  // Handle completion of initial setup
  const handleSetupComplete = () => {
    setNeedsInitialSetup(false);
    fetchData(); // Refresh data after setup
  };

  // If we need initial setup, show the setup flow instead of the main app
  if (needsInitialSetup && !loading) {
    return <InitialSetupFlow onComplete={handleSetupComplete} />;
  }

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Container for proper margins */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem 0', 
          borderBottom: '1px solid var(--divider)' 
        }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            margin: 0, 
            color: 'var(--text)' 
          }}>
            Stepie Tracker
          </h1>
          
          <button style={{ 
            backgroundColor: 'transparent', 
            color: 'var(--text)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            padding: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </header>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 128, 0, 0.8)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.375rem',
            zIndex: 100,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {showSuccessMessage}
          </div>
        )}
        
        {/* Loading and Error States */}
        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading your data...</p>}
        
        {error && (
          <div style={{ 
            margin: '1rem 0', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            backgroundColor: '#FFEBEE', 
            color: '#B71C1C' 
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Main Content */}
        {!loading && (
          <main style={{ padding: '1rem 0' }}>
            {/* Weight Chart - Increased height and top padding */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--text)',
                  margin: 0
                }}>
                  Weight Progress
                </h2>
                <button style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '0.25rem', 
                  backgroundColor: 'rgba(255, 160, 0, 0.1)', 
                  color: 'var(--primary)',
                  border: 'none'
                }}>
                  LAST 30 DAYS
                </button>
              </div>
              
              <div style={{ 
                height: '400px',
                width: '100%', 
                backgroundColor: 'white', 
                borderRadius: '0.5rem', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '20px 10px 10px 10px' // Added more padding on top
              }}>
                {weightEntries.length > 0 ? (
                  <WeightChart 
                    weightEntries={weightEntries} 
                    targetWeight={goals.targetWeight}
                  />
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    No weight data yet. Add your first entry!
                  </p>
                )}
              </div>
            </div>
            
            {/* Activity Heatmap - Using our new component */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem', 
                color: 'var(--text)',
                margin: 0,
              }}>
                Activity Heatmap
              </h2>
              
              {/* Use our custom ActivityHeatmap component */}
              <ActivityHeatmap 
                weightEntries={weightEntries}
                dietEntries={dietEntries}
                workoutEntries={workoutEntries}
              />
              
              {/* Add Button Row - Positioned below the heatmap, within app boundaries */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginBottom: '1.5rem'
              }}>
                <div 
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowAddModal(true)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
      
      {/* Add Modal - Using our updated modal component */}
      {showAddModal && (
        <AddEntryModal 
          onSaveWeight={handleAddWeightEntry}
          onSaveDiet={handleAddDietEntry}
          onSaveWorkout={handleAddWorkoutEntry}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default App;