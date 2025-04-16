import React from 'react';
import WeightForm from './WeightForm';
import WeightChart from './WeightChart';
import WeightList from './WeightList';

function WeightTracker({ weightEntries, targetWeight, stepSize, onAddEntry, onUpdateEntry, onDeleteEntry }) {

  const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const startWeight = weightEntries.length > 0 ? weightEntries[0].weight : null;

  let progress = 0;
  let totalToGoal = 0;
  if (currentWeight !== null && targetWeight !== null && startWeight !== null) {
      totalToGoal = Math.abs(targetWeight - startWeight);
      const progressMade = startWeight - currentWeight;
      if (totalToGoal > 0) {
          progress = (progressMade / totalToGoal) * 100;
          if (targetWeight > startWeight) {
              progress = ((currentWeight - startWeight) / totalToGoal) * 100;
          }
      }
      progress = Math.max(0, Math.min(100, progress));
  }

  const miniGoals = [];
    if (targetWeight !== null && startWeight !== null && stepSize > 0) {
        const losingWeight = targetWeight < startWeight;
        let nextStep = losingWeight ? startWeight - stepSize : startWeight + stepSize;
        const stepIncrement = losingWeight ? -stepSize : stepSize;

        while (losingWeight ? nextStep >= targetWeight : nextStep <= targetWeight) {
            miniGoals.push({
                target: nextStep,
                achieved: currentWeight !== null && (losingWeight ? currentWeight <= nextStep : currentWeight >= nextStep)
            });
            nextStep += stepIncrement;
            if (miniGoals.length > 100) break;
        }
        if (!miniGoals.some(g => g.target === targetWeight) && targetWeight !== startWeight) {
           miniGoals.push({
              target: targetWeight,
              achieved: currentWeight !== null && (losingWeight ? currentWeight <= targetWeight : currentWeight >= targetWeight)
           });
        }
    }


  // Basic Progress Bar Styles
  const progressBarStyle = {
    outer: {
      height: '1.0rem', // Approx h-4
      backgroundColor: '#e5e7eb', // gray-200
      borderRadius: '9999px', // rounded-full
      marginTop: '0.75rem',
      marginBottom: '0.25rem',
      overflow: 'hidden',
      width: '100%',
    },
    inner: {
      backgroundColor: '#22c55e', // green-500
      height: '100%',
      borderRadius: '9999px',
      transition: 'width 500ms ease-out',
      width: `${progress}%`,
    }
  };

  // Basic Mini Goal Styles
  const miniGoalStyle = (achieved) => ({
      display: 'inline-block',
      padding: '0.25rem 0.75rem', // Approx px-3 py-1
      borderRadius: '9999px', // rounded-full
      fontSize: '0.875rem', // text-sm
      fontWeight: 500, // font-medium
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
      backgroundColor: achieved ? '#dcfce7' : '#e5e7eb', // green-200 : gray-200
      color: achieved ? '#166534' : '#374151', // green-800 : gray-700
  });


  return (
    <div className="space-y-6">
        {/* Progress Summary */}
        {targetWeight !== null && currentWeight !== null && (
            <div className="card text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Progress Overview</h3>
                <p>Current: <span className="font-bold">{currentWeight}</span> | Target: <span className="font-bold">{targetWeight}</span></p>
                 {startWeight !== null && (
                    <p className="text-sm text-gray-500">Started at: {startWeight}</p>
                 )}
                 {/* Basic Progress Bar */}
                 <div style={progressBarStyle.outer}>
                    <div style={progressBarStyle.inner}></div>
                 </div>
                <p className="text-sm font-medium text-green-600">{progress.toFixed(1)}% Complete</p>
            </div>
        )}

         {/* Mini Goals Display */}
         {miniGoals.length > 0 && (
             <div className="card">
                 <h3 className="text-lg font-semibold text-gray-700" style={{ marginBottom: '0.75rem' }}>Mini Goals ({stepSize} steps)</h3>
                 {/* Use basic styles defined above */}
                 <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {miniGoals.map((goal, index) => (
                        <span key={index} style={miniGoalStyle(goal.achieved)}>
                            {goal.achieved ? '✓ ' : ''}{goal.target}
                        </span>
                    ))}
                 </div>
             </div>
         )}

        {/* Chart */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Weight History</h3>
          <WeightChart weightEntries={weightEntries} targetWeight={targetWeight} />
        </div>

        {/* Form */}
        <WeightForm onAddEntry={onAddEntry} />

        {/* Data List/Table */}
        <WeightList
          entries={weightEntries}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
         />

    </div>
  );
}

export default WeightTracker;