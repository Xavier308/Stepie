import React, { useState, useEffect } from 'react';

function SettingsModal({ goals, onSave, onCancel }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [stepSize, setStepSize] = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');

  useEffect(() => {
    // Initialize form with current goals
    setTargetWeight(goals.targetWeight ?? '');
    setStepSize(goals.stepSize ?? 5);
    setWeightUnit(goals.weight_unit ?? 'lbs');
  }, [goals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      targetWeight: targetWeight === '' ? null : parseFloat(targetWeight),
      stepSize: parseInt(stepSize, 10) || 5,
      weight_unit: weightUnit
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Settings
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Target Weight
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg focus:outline-none"
              style={{ borderColor: 'var(--divider)' }}
              placeholder="e.g., 150"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Mini-Goal Step Size
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg focus:outline-none"
              style={{ borderColor: 'var(--divider)' }}
              placeholder="e.g., 5"
              value={stepSize}
              onChange={(e) => setStepSize(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Break down your goal into steps of this size.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Units
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['lbs', 'kg'].map((unit) => (
                <button 
                  key={unit}
                  type="button"
                  className="py-2 px-4 rounded-lg border text-center"
                  style={{
                    borderColor: weightUnit === unit ? 'var(--primary)' : 'var(--divider)',
                    backgroundColor: weightUnit === unit ? 'rgba(255, 160, 0, 0.1)' : 'white',
                    color: weightUnit === unit ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setWeightUnit(unit)}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          
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

export default SettingsModal;