import React, { useState } from 'react';
import DietEntryForm from './DietEntryForm';
import WorkoutEntryForm from './WorkoutEntryForm';

function AddEntryModal({ onSaveWeight, onSaveDiet, onSaveWorkout, onCancel }) {
  const [entryType, setEntryType] = useState('weight');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmitWeight = (e) => {
    e.preventDefault();
    if (!weight || !date) {
      alert("Please enter both weight and date.");
      return;
    }
    
    onSaveWeight({
      weight: parseFloat(weight),
      date: date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl" style={{
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
            ].map((action) => (
              <button 
                key={action.id}
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${entryType === action.id ? 'var(--primary)' : 'var(--divider)'}`,
                  backgroundColor: entryType === action.id ? 'rgba(255, 160, 0, 0.1)' : 'white',
                  color: entryType === action.id ? 'var(--primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setEntryType(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        
        {entryType === 'weight' && (
          <form onSubmit={handleSubmitWeight}>
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
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem' 
            }}>
              <button
                type="button"
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.375rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {entryType === 'diet' && (
          <DietEntryForm onSave={onSaveDiet} onCancel={onCancel} />
        )}

        {entryType === 'workout' && (
          <WorkoutEntryForm onSave={onSaveWorkout} onCancel={onCancel} />
        )}
      </div>
    </div>
  );
}

export default AddEntryModal;