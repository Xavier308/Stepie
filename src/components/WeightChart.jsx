import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

function WeightChart({ weightEntries = [], targetWeight }) {
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sortedEntries.map(entry =>
    new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const dataPoints = sortedEntries.map(entry => entry.weight);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Your Weight',
        data: dataPoints,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

   const options = {
     responsive: true,
     maintainAspectRatio: false,
     scales: {
       y: {
         beginAtZero: false,
         title: {
             display: true,
             text: 'Weight'
         }
       },
       x: {
         title: {
             display: true,
             text: 'Date'
         }
       }
     },
     plugins: {
       legend: {
         position: 'top',
       },
       title: {
         display: false,
       },
        annotation: {
            annotations: {
                ...(targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight) && {
                    targetLine: {
                        type: 'line',
                        yMin: targetWeight,
                        yMax: targetWeight,
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: `Target: ${targetWeight}`,
                            position: 'end',
                            enabled: true,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            font: {
                               weight: 'bold'
                            },
                            color: 'white',
                            xAdjust: 10,
                            yAdjust: -10
                        }
                    }
                })
            }
        }
     },
   };

  // Container needs explicit height for chart.js canvas
  return (
    <div style={{ height: '300px', position: 'relative' }}> {/* Position relative might be needed for tooltips/annotations */}
      {weightEntries.length > 0 ? (
         <Line options={options} data={data} />
      ) : (
         <p className="text-center text-gray-500">No weight data yet. Add your first entry!</p>
      )}
    </div>
  );
}

export default WeightChart;