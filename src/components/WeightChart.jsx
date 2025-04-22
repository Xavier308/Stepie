// WeightChart.jsx - Updated for SQLite data format
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
  // Make sure we have entries and they're in date order
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Format dates for display
  const labels = sortedEntries.map(entry =>
    new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  
  // Make sure all weights are integers for cleaner display
  const dataPoints = sortedEntries.map(entry => Math.round(Number(entry.weight)));

  // Calculate appropriate y-axis range
  const minWeight = dataPoints.length ? Math.min(...dataPoints) : 150;
  const maxWeight = dataPoints.length ? Math.max(...dataPoints) : 220;
  const weightBuffer = Math.max(5, Math.round((maxWeight - minWeight) * 0.2)); // At least 5 units or 20% buffer

  // Orange-based color scheme for consistency with app design
  const lineColor = '#FFA000'; // Primary orange
  const pointColor = '#FF8F00'; // Slightly darker orange for points
  const pointBorderColor = '#FFFFFF'; // White border for contrast
  const fillColor = 'rgba(255, 160, 0, 0.15)'; // Very light orange fill
  const targetLineColor = '#FF6D00'; // Deep orange for target line

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Weight',
        data: dataPoints,
        borderColor: lineColor,
        backgroundColor: fillColor,
        tension: 0.3, // Smoother line
        fill: true,
        pointBackgroundColor: pointColor,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
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
          color: 'var(--text-secondary, #757575)',
          font: {
            size: 12
          },
          stepSize: Math.max(1, Math.round((maxWeight - minWeight) / 10)), // Dynamic step size
          callback: function(value) {
            return Math.round(value); // Ensure integer display
          }
        },
        min: Math.floor(Math.max(0, minWeight - weightBuffer)),
        max: Math.ceil(maxWeight + weightBuffer),
        title: {
          display: true,
          text: 'Weight',
          color: 'var(--text-secondary, #757575)',
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
          color: 'var(--text-secondary, #757575)',
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: Math.min(12, labels.length), // Limit label count based on data size
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FFA000',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Weight: ${Math.round(context.parsed.y)}`;
          },
          title: function(context) {
            return context[0].label;
          }
        }
      },
      annotation: targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight) ? {
        annotations: {
          targetLine: {
            type: 'line',
            yMin: targetWeight,
            yMax: targetWeight,
            borderColor: targetLineColor,
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: `Target: ${Math.round(targetWeight)}`,
              position: 'end',
              enabled: true,
              backgroundColor: targetLineColor,
              font: {
                weight: 'bold'
              },
              color: 'white',
              xAdjust: 10,
              yAdjust: -10
            }
          }
        }
      } : {}
    },
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', padding: '0.5rem' }}>
      {sortedEntries.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary, #757575)', 
          paddingTop: '2rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center' 
        }}>
          <p>No weight data yet.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Add your first entry to see your progress!</p>
        </div>
      )}
    </div>
  );
}

export default WeightChart;