// Improved WeightChart.jsx with integer weights
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
  
  // #5 Fix: Make sure all weights are integers
  const dataPoints = sortedEntries.map(entry => Math.round(entry.weight));

  // Find min/max for better y-axis display
  const minWeight = dataPoints.length ? Math.min(...dataPoints) : 150;
  const maxWeight = dataPoints.length ? Math.max(...dataPoints) : 220;
  const weightBuffer = (maxWeight - minWeight) * 0.2; // 20% buffer for better visualization

  // Enhanced color scheme
  const lineColor = '#FF8000'; // More intense orange
  const pointColor = '#FF4500'; // Deep orange-red for points
  const pointBorderColor = '#FFFFFF'; // White border for contrast
  const fillColor = 'rgba(255, 160, 0, 0.15)'; // Lighter orange fill

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Weight (lbs)',
        data: dataPoints,
        borderColor: lineColor,
        backgroundColor: fillColor,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: pointColor,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3, // Thicker line for better visibility
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#EEEEEE',
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 12
          },
          // #5 Fix: Display integers only (no decimals)
          stepSize: 5,
          callback: function(value) {
            return Math.round(value) + ' lbs'; // Ensure integer display
          }
        },
        // Better min/max with buffer to avoid cutting off points
        min: Math.floor(Math.max(0, minWeight - weightBuffer)),
        max: Math.ceil(maxWeight + weightBuffer),
        title: {
          display: true,
          text: 'Weight (lbs)',
          color: 'var(--text-secondary)',
          font: {
            size: 12,
            weight: 'normal'
          },
          padding: 10
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--text-secondary)',
          maxRotation: 45, // Allow rotation for better readability
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: 'var(--text-secondary)',
          font: {
            size: 12,
            weight: 'normal'
          },
          padding: 10
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FF8000', // Match line color
        titleColor: '#FFF',
        bodyColor: '#FFF',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            // #5 Fix: Display integer weight in tooltip
            return `Weight: ${Math.round(context.parsed.y)} lbs`;
          },
          title: function(context) {
            return context[0].label;
          }
        }
      },
      annotation: {
        annotations: {
          ...(targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight) && {
            targetLine: {
              type: 'line',
              yMin: targetWeight,
              yMax: targetWeight,
              borderColor: '#FF4500', // Deep orange-red
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                // #5 Fix: Display integer target weight
                content: `Target: ${Math.round(targetWeight)} lbs`,
                position: 'end',
                enabled: true,
                backgroundColor: '#FF4500',
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

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', padding: '0.5rem' }}>
      {weightEntries.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: '2rem' }}>
          No weight data yet. Add your first entry!
        </p>
      )}
    </div>
  );
}

export default WeightChart;