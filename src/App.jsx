// App.jsx with fixes
import React, { useState, useEffect } from 'react';
import WeightChart from './components/WeightChart';
import apiService from './services/apiService';
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

  // Use dummy data if no entries are available
  useEffect(() => {
    if (weightEntries.length === 0 && !loading) {
      // Generate sample data showing weight loss from 210 to 185 over 3 months
      const dummyData = generateDummyWeightData(210, 185, 90); // 90 days = ~3 months
      setWeightEntries(dummyData);
    }
  }, [weightEntries, loading]);

  // Generate dummy weight data
  const generateDummyWeightData = (startWeight, endWeight, days) => {
    const data = [];
    const weightChange = startWeight - endWeight;
    const todayDate = new Date();
    
    for (let i = days; i >= 0; i -= 3) { // Every 3 days
      const entryDate = new Date();
      entryDate.setDate(todayDate.getDate() - i);
      
      // Calculate weight with some random variation to make it more realistic
      const progress = 1 - (i / days);
      const exactWeight = startWeight - (weightChange * progress);
      const randomVariation = (Math.random() * 2 - 1) * 1.5; // Random variation of ±1.5 lbs
      const weight = Math.round((exactWeight + randomVariation) * 10) / 10;
      
      data.push({
        date: entryDate.toISOString().slice(0, 10),
        weight: weight
      });
    }
    
    return data;
  };

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

  // Generate months and proper column counts for heatmap
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

  const weekdays = ['Mon', 'Wed', 'Fri'];

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
            Stepie
          </h1>
          
          {/* Fix gear icon styling */}
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
            {/* Weight Chart - Increased height */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.75rem' 
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
                height: '400px', // Increased height
                width: '100%', 
                backgroundColor: 'white', 
                borderRadius: '0.5rem', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                {weightEntries.length > 0 ? (
                  <WeightChart 
                    weightEntries={weightEntries} 
                    targetWeight={goals.targetWeight || 175} // Default target if not set
                  />
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    No weight data yet. Add your first entry!
                  </p>
                )}
              </div>
            </div>
            
            {/* Activity Heatmap - Adjusted to match chart width */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                color: 'var(--text)',
                margin: 0,
                marginBottom: '0.75rem'
              }}>
                Activity Heatmap
              </h2>
              
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '1rem'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ 
                    display: 'flex', 
                    minWidth: 'max-content',
                    paddingBottom: '0.5rem'
                  }}>
                    {/* Month headers */}
                    <div style={{ width: '40px' }}></div> {/* Space for weekday labels */}
                    <div style={{ display: 'flex' }}>
                      {monthData.map((month, idx) => (
                        <div key={idx} style={{ 
                          textAlign: 'center',
                          minWidth: `${month.columns * 30}px`,
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {month.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex' }}>
                    {/* Day labels */}
                    <div style={{ 
                      width: '40px', 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-around',
                      paddingRight: '0.5rem'
                    }}>
                      {weekdays.map((day, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            height: '30px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end',
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Month columns with correct column counts */}
                    <div style={{ display: 'flex' }}>
                      {monthData.map((month, monthIdx) => (
                        <div key={monthIdx} style={{ display: 'flex' }}>
                          {[...Array(month.columns)].map((_, colIdx) => (
                            <div key={colIdx} style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '6px',
                              padding: '0 2px'
                            }}>
                              {weekdays.map((_, rowIdx) => (
                                <div 
                                  key={rowIdx} 
                                  style={{
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '4px',
                                    backgroundColor: Math.random() > 0.3 
                                      ? `rgba(255, 160, 0, ${Math.random() * 0.8 + 0.2})` 
                                      : '#EEEEEE'
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div 
        style={{ 
          position: 'fixed', 
          right: '1.5rem', 
          bottom: '1.5rem', 
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