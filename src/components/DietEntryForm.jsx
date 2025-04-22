import React, { useState } from 'react';

const DietEntryForm = ({ onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState('breakfast');
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!foodItem || !calories || !date) {
      alert("Please enter at least food item, calories, and date");
      return;
    }
    
    // Create diet entry object
    const dietEntry = {
      date,
      mealType,
      foodItem,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
    };
    
    // Pass to parent component
    onSave(dietEntry);
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
          Meal Type
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
            <button 
              key={meal}
              type="button"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: `1px solid ${mealType === meal ? 'var(--primary)' : 'var(--divider)'}`,
                backgroundColor: mealType === meal ? 'rgba(255, 160, 0, 0.1)' : 'white',
                color: mealType === meal ? 'var(--primary)' : 'var(--text-secondary)',
                textTransform: 'capitalize'
              }}
              onClick={() => setMealType(meal)}
            >
              {meal}
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
          Food Item
        </label>
        <input
          type="text"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--divider)',
            fontSize: '1rem'
          }}
          placeholder="e.g., Grilled Chicken Salad"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
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
          Calories
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
          placeholder="e.g., 350"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            Protein (g)
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
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            Carbs (g)
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
            placeholder="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            Fat (g)
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
            placeholder="0"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>
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

export default DietEntryForm;