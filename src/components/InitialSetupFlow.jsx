// InitialSetupFlow.jsx - First-time user onboarding
import React, { useState } from 'react';
import apiService from '../services/apiService';

function InitialSetupFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [weightData, setWeightData] = useState({ weight: '', date: new Date().toISOString().slice(0, 10) });
  const [goalData, setGoalData] = useState({ targetWeight: '', stepSize: 5, weight_unit: 'lbs' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Move to next step
  const nextStep = () => setStep(step + 1);
  
  // Go back to previous step
  const prevStep = () => setStep(step - 1);

  // Handle form input changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeightData({ ...weightData, [name]: value });
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setGoalData({ ...goalData, [name]: value });
  };

  // Submit all data and complete setup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would create the user first
      // For simplicity with the current API, we'll use default user (id: 1)
      
      // Save initial weight
      if (weightData.weight) {
        await apiService.addWeightEntry({
          weight: parseFloat(weightData.weight),
          date: weightData.date,
          user_id: 1
        });
      }
      
      // Save goals
      await apiService.updateGoals(null, {
        targetWeight: goalData.targetWeight ? parseFloat(goalData.targetWeight) : null,
        stepSize: parseInt(goalData.stepSize, 10) || 5,
        weight_unit: goalData.weight_unit,
        user_id: 1
      });
      
      // Inform parent component that setup is complete
      onComplete();
      
    } catch (err) {
      console.error("Setup error:", err);
      setError("There was an error saving your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="card text-center">
            <h2 style={{ marginBottom: '1.5rem' }}>Welcome to Stepie Tracker!</h2>
            <p style={{ marginBottom: '2rem' }}>
              Let's set up your weight tracking profile in a few quick steps.
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              <button 
                onClick={nextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Record Your Starting Weight</h2>
            <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
              What's your current weight? This will be your starting point.
            </p>
            
            <form>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Current Weight:
                </label>
                <input
                  type="number"
                  name="weight"
                  value={weightData.weight}
                  onChange={handleWeightChange}
                  placeholder="e.g., 180"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--divider)'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={weightData.date}
                  onChange={handleWeightChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--divider)'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '2rem'
              }}>
                <button 
                  type="button"
                  onClick={prevStep}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--divider)',
                    fontSize: '0.875rem'
                  }}
                >
                  Back
                </button>
                <button 
                  type="button"
                  onClick={nextStep}
                  disabled={!weightData.weight}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    color: 'white',
                    backgroundColor: 'var(--primary)',
                    border: 'none',
                    fontSize: '0.875rem',
                    opacity: !weightData.weight ? 0.7 : 1
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        );
        
      case 3:
        return (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Set Your Weight Goal</h2>
            <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
              What weight would you like to achieve? (You can change this later)
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Target Weight:
                </label>
                <input
                  type="number"
                  name="targetWeight"
                  value={goalData.targetWeight}
                  onChange={handleGoalChange}
                  placeholder="e.g., 165"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--divider)'
                  }}
                />
                <p style={{ 
                  marginTop: '0.25rem', 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  Leave empty if you just want to track weight without a specific goal.
                </p>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Mini-Goal Step Size:
                </label>
                <input
                  type="number"
                  name="stepSize"
                  value={goalData.stepSize}
                  onChange={handleGoalChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--divider)'
                  }}
                />
                <p style={{ 
                  marginTop: '0.25rem', 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  Break down your goal into smaller steps (e.g., every 5 lbs).
                </p>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Weight Unit:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {['lbs', 'kg'].map((unit) => (
                    <button 
                      key={unit}
                      type="button"
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: `1px solid ${goalData.weight_unit === unit ? 'var(--primary)' : 'var(--divider)'}`,
                        backgroundColor: goalData.weight_unit === unit ? 'rgba(255, 160, 0, 0.1)' : 'white',
                        color: goalData.weight_unit === unit ? 'var(--primary)' : 'var(--text-secondary)'
                      }}
                      onClick={() => setGoalData({ ...goalData, weight_unit: unit })}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              
              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#FFEBEE', 
                  color: '#B71C1C',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '2rem'
              }}>
                <button 
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--divider)',
                    fontSize: '0.875rem'
                  }}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    color: 'white',
                    backgroundColor: 'var(--primary)',
                    border: 'none',
                    fontSize: '0.875rem',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Finish Setup'}
                </button>
              </div>
            </form>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem' }}>
      {/* Progress indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem',
        gap: '0.5rem'
      }}>
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: step >= stepNum ? 'var(--primary)' : '#e0e0e0'
          }} />
        ))}
      </div>
      
      {/* Current step */}
      {renderStep()}
    </div>
  );
}

export default InitialSetupFlow;