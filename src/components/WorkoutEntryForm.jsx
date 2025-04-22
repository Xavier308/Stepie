import React, { useState } from 'react';

const WorkoutEntryForm = ({ onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [workoutType, setWorkoutType] = useState('cardio');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');

  // Workout type options
  const workoutTypes = [
    { id: 'cardio', label: 'Cardio' },
    { id: 'strength', label: 'Strength' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'sports', label: 'Sports' },
    { id: 'walking', label: 'Walking' },
    { id: 'other', label: 'Other' }
  ];

  // Intensity levels
  const intensityLevels = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!workoutType || !duration || !date) {
      alert("Please enter at least workout type, duration, and date");
      return;
    }
    
    // Create workout entry object
    const workoutEntry = {
      date,
      workoutType,
      duration: parseInt(duration, 10) || 0,
      intensity,
      caloriesBurned: parseInt(caloriesBurned, 10) || 0,
      notes
    };
    
    // Pass to parent component
    onSave(workoutEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem',
          color: 'var(--text-secondary)'
        }}>
          Workout Type
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem' 
        }}>
          {workoutTypes.map((type) => (
            <button 
              key={type.id}
              type="button"
              style={{
                padding: '0.5rem 0.5rem',
                borderRadius: '0.375rem',
                border: `1px solid ${workoutType === type.id ? 'var(--primary)' : 'var(--divider)'}`,
                backgroundColor: workoutType === type.id ? 'rgba(255, 160, 0, 0.1)' : 'white',
                color: workoutType === type.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.875rem'
              }}
              onClick={() => setWorkoutType(type.id)}
            >
              {type.label}
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
          Duration (minutes)
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
          placeholder="e.g., 45"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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
          Intensity
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem' 
        }}>
          {intensityLevels.map((level) => (
            <button 
              key={level.id}
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: `1px solid ${intensity === level.id ? 'var(--primary)' : 'var(--divider)'}`,
                backgroundColor: intensity === level.id ? 'rgba(255, 160, 0, 0.1)' : 'white',
                color: intensity === level.id ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setIntensity(level.id)}
            >
              {level.label}
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
          Calories Burned (optional)
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
          placeholder="e.g., 250"
          value={caloriesBurned}
          onChange={(e) => setCaloriesBurned(e.target.value)}
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
          Notes (optional)
        </label>
        <textarea
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--divider)',
            fontSize: '1rem',
            minHeight: '80px',
            resize: 'vertical'
        }}
        placeholder="Add details about your workout..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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
);
};

export default WorkoutEntryForm;