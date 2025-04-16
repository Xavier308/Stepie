import React, { useState, useEffect } from 'react';

function GoalManager({ goals, onUpdateGoals }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [stepSize, setStepSize] = useState('');

  useEffect(() => {
    setTargetWeight(goals.targetWeight ?? '');
    setStepSize(goals.stepSize ?? 5);
  }, [goals]);

  const handleSaveGoals = (e) => {
    e.preventDefault();
    const updatedGoalData = {
      ...goals,
      targetWeight: targetWeight === '' ? null : parseFloat(targetWeight),
      stepSize: parseInt(stepSize, 10) || 5,
    };
    onUpdateGoals(updatedGoalData);
  };

  return (
    <div className="card"> {/* Use basic card class */}
      <h2 className="mb-4 text-gray-700">Your Goals</h2>
      <form onSubmit={handleSaveGoals} className="space-y-4"> {/* Basic spacing */}
        <div>
          <label htmlFor="targetWeight" style={{ display: 'block', marginBottom: '5px' }}>
            Target Weight:
          </label>
          <input
            type="number"
            id="targetWeight"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="e.g., 150"
            // Basic input styles applied via index.css
          />
        </div>
        <div>
          <label htmlFor="stepSize" style={{ display: 'block', marginBottom: '5px' }}>
            Mini-Goal Step Size:
          </label>
          <input
            type="number"
            id="stepSize"
            step="1"
            min="1"
            value={stepSize}
            onChange={(e) => setStepSize(e.target.value)}
            placeholder="e.g., 5"
            // Basic input styles applied via index.css
          />
          <p className="text-xs text-gray-500" style={{marginTop: '3px'}}>Break down your goal into steps of this size.</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Additional Goals</h3>
          {goals.additionalGoals?.length > 0 ? (
            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
              {goals.additionalGoals.map((goal, index) => (
                <li key={goal.id || index}>{goal.description}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No additional goals set yet.</p>
          )}
          {/* Add form/button to add new additional goals here */}
        </div>

        <button type="submit" className="w-full button-success" style={{marginTop: '1rem'}}> {/* Basic button style */}
          Save Goals
        </button>
      </form>
    </div>
  );
}

export default GoalManager;