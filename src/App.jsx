// App.jsx with proper database initialization
import React, { useState, useEffect } from 'react';
import WeightChart from './components/WeightChart';
import apiService from './services/apiService';
import InitialSetupFlow from './components/InitialSetupFlow';
import './index.css'; 

function App() {
  // State for data
  const [weightEntries, setWeightEntries] = useState([]);
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
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weight entries
      const fetchedWeightData = await apiService.getWeightEntries();
      setWeightEntries(fetchedWeightData.sort((a, b) => new Date(a.date) - new Date(b.date)) || []);

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
  const handleAddWeightEntry = async () => {
    if (!newWeight) {
      alert("Please enter a weight value");
      return;
    }
    
    try {
      setError(null);
      const newEntry = {
        weight: parseFloat(newWeight),
        date: newDate,
      };
      
      const addedEntry = await apiService.addWeightEntry(newEntry);
      setWeightEntries(prev => [...prev, addedEntry].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAddModal(false);
      setNewWeight('');
    } catch (err) {
      console.error("Failed to add weight entry:", err);
      setError("Could not save weight entry.");
    }
  };

  // Handle completion of initial setup
  const handleSetupComplete = () => {
    setNeedsInitialSetup(false);
    fetchData(); // Refresh data after setup
  };

  // Generate GitHub-style heatmap data (simplified)
  // Month column distribution following GitHub's pattern
  const monthData = [
    { name: 'Jan', columns: 4 },
    { name: 'Feb', columns: 4 },
    { name: 'Mar', columns: 5 },
    { name: 'Apr', columns: 5 },
    { name: 'May', columns: 4 },
    { name: 'Jun', columns: 5 },
    { name: 'Jul', columns: 4 },
    { name: 'Aug', columns: 4 },
    { name: 'Sep', columns: 5 },
    { name: 'Oct', columns: 4 },
    { name: 'Nov', columns: 4 },
    { name: 'Dec', columns: 5 }
  ];

  // Day labels with empty slots between main labels (GitHub style)
  const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

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
                  CLEAR THIS MONTH
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
            
            {/* GitHub-style Activity Heatmap */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1.25rem', // Increased space
                color: 'var(--text)',
                margin: 0,
              }}>
                Activity Heatmap
              </h2>
              
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
                marginBottom: '1rem', // Space between heatmap and button row
                overflow: 'hidden'
              }}>
                {/* Month headers */}
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '35px' }}></div> {/* Space for weekday labels */}
                  <div style={{ display: 'flex', width: 'calc(100% - 35px)' }}>
                    {monthData.map((month, idx) => (
                      <div key={idx} style={{ 
                        textAlign: 'center',
                        width: `${(month.columns / 53) * 100}%`, // Width proportional to column count
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {month.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', marginTop: '4px' }}>
                  {/* Day labels - GitHub style with 7 rows */}
                  <div style={{ 
                    width: '35px', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    paddingRight: '4px'
                  }}>
                    {weekdayLabels.map((day, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          height: '13px', // Smaller, GitHub-like squares
                          fontSize: '0.7rem',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end',
                          color: 'var(--text-secondary)',
                          marginTop: index === 0 ? '0' : '2px', // Space between rows
                          marginBottom: index === 6 ? '0' : '2px'
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* GitHub-style heatmap grid */}
                  <div style={{ display: 'flex', width: 'calc(100% - 35px)' }}>
                    {/* Create 53 columns (52-53 weeks in a year) */}
                    {monthData.flatMap((month, monthIdx) => 
                      [...Array(month.columns)].map((_, colIdx) => (
                        <div key={`${monthIdx}-${colIdx}`} style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: '2px',
                          padding: '0 1px',
                          width: `${(1 / 53) * 100}%` // Even width for all 53 columns
                        }}>
                          {/* 7 rows for each day of the week */}
                          {[...Array(7)].map((_, rowIdx) => (
                            <div 
                              key={rowIdx} 
                              style={{
                                width: '100%', 
                                paddingBottom: '100%', // Square aspect ratio
                                position: 'relative',
                                borderRadius: '2px',
                                backgroundColor: Math.random() > 0.7 
                                  ? `rgba(255, 160, 0, ${Math.random() * 0.8 + 0.2})` 
                                  : '#EEEEEE',
                                marginTop: rowIdx === 0 ? '0' : '2px', // Space between rows
                                marginBottom: rowIdx === 6 ? '0' : '2px'
                              }}
                            />
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
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
      
      {/* Add Modal */}
      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            width: '100%', 
            maxWidth: '400px', 
            padding: '1.5rem', 
            margin: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: 'var(--text)'
            }}>
              Add New Entry
            </h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}>
                Select Action
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'weight', label: 'Weight' },
                  { id: 'workout', label: 'Workout' },
                  { id: 'diet', label: 'Diet' }
                ].map((action, i) => (
                  <button 
                    key={action.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--divider)'}`,
                      backgroundColor: i === 0 ? 'rgba(255, 160, 0, 0.1)' : 'white',
                      color: i === 0 ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}>
                Weight
              </label>
              <input
                type="number"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--divider)',
                  fontSize: '1rem'
                }}
                placeholder="e.g., 175"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}>
                Date
              </label>
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--divider)',
                  fontSize: '1rem'
                }}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem' 
            }}>
              <button
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.375rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onClick={handleAddWeightEntry}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;