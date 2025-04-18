import React, { useState } from 'react';

function AddEntryModal({ onSave, onCancel }) {
  const [entryType, setEntryType] = useState('weight');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entryType === 'weight' && weight && date) {
      onSave({
        weight: parseFloat(weight),
        date: date,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Add New Entry
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Select Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'weight', label: 'Weight' },
                { id: 'workout', label: 'Workout' },
                { id: 'diet', label: 'Diet' }
              ].map((action) => (
                <button 
                  key={action.id}
                  type="button"
                  className="py-2 px-4 rounded-lg border text-center"
                  style={{
                    borderColor: entryType === action.id ? 'var(--primary)' : 'var(--divider)',
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
            <>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Weight
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: 'var(--divider)' }}
                  placeholder="e.g., 175"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: 'var(--divider)' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Placeholder for workout form fields */}
          {entryType === 'workout' && (
            <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              Workout tracking coming soon!
            </div>
          )}

          {/* Placeholder for diet form fields */}
          {entryType === 'diet' && (
            <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              Diet tracking coming soon!
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEntryModal;