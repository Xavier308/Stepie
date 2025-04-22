import React, { useMemo } from 'react';

const ActivityHeatmap = ({ weightEntries = [], dietEntries = [], workoutEntries = [] }) => {
  // Month column distribution following GitHub's pattern
  const monthData = [
    { name: 'Jan', columns: 4 },
    { name: 'Feb', columns: 4 },
    { name: 'Mar', columns: 5 },
    { name: 'Apr', columns: 5 },
    { name: 'May', columns: 4 },
    { name: 'Jun', columns: 5 },
    { name: 'Jul', columns: 4 },
    { name: 'Aug', columns: 4 },
    { name: 'Sep', columns: 5 },
    { name: 'Oct', columns: 4 },
    { name: 'Nov', columns: 4 },
    { name: 'Dec', columns: 5 }
  ];

  // Day labels with empty slots between main labels (GitHub style)
  const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Process all entries to generate heatmap data
  const heatmapData = useMemo(() => {
    // Initialize empty activity data structure
    const activityData = {};
    
    // Get current date
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create date range - we'll show a full year of data
    const endDate = today;
    const startDate = new Date(currentYear - 1, today.getMonth(), today.getDate());
    
    // For each day in our range, initialize with 0 activity
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
      activityData[dateKey] = {
        count: 0,
        types: {
          weight: 0,
          diet: 0,
          workout: 0
        }
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Process weight entries
    weightEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateKey = entryDate.toISOString().slice(0, 10);
      
      // Only count if within our date range
      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.weight += 1;
      }
    });
    
    // Process diet entries
    dietEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateKey = entryDate.toISOString().slice(0, 10);
      
      // Only count if within our date range
      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.diet += 1;
      }
    });
    
    // Process workout entries
    workoutEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateKey = entryDate.toISOString().slice(0, 10);
      
      // Only count if within our date range
      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.workout += 1;
      }
    });
    
    // Calculate intensity levels (0-4)
    Object.keys(activityData).forEach(dateKey => {
      const count = activityData[dateKey].count;
      if (count === 0) {
        activityData[dateKey].intensity = 0;
      } else if (count === 1) {
        activityData[dateKey].intensity = 1;
      } else if (count === 2) {
        activityData[dateKey].intensity = 2;
      } else if (count === 3) {
        activityData[dateKey].intensity = 3;
      } else {
        activityData[dateKey].intensity = 4;
      }
    });
    
    return activityData;
  }, [weightEntries, dietEntries, workoutEntries]);
  
  // Function to get week number within the year
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Function to get cell color based on intensity
  const getCellColor = (intensity) => {
    switch(intensity) {
      case 0: return '#EEEEEE'; // Empty
      case 1: return 'rgba(255, 160, 0, 0.3)'; // Light activity
      case 2: return 'rgba(255, 160, 0, 0.5)'; // Medium activity
      case 3: return 'rgba(255, 160, 0, 0.7)'; // High activity
      case 4: return 'rgba(255, 160, 0, 0.9)'; // Very high activity
      default: return '#EEEEEE';
    }
  };
  
  // Function to get tooltip text for a cell
  const getTooltipText = (dateStr, activity) => {
    if (!activity) return 'No data';
    
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const { count, types } = activity;
    
    if (count === 0) {
      return `No activity on ${formattedDate}`;
    }
    
    let tooltip = `${count} ${count === 1 ? 'entry' : 'entries'} on ${formattedDate}:\n`;
    
    if (types.weight > 0) {
      tooltip += `• ${types.weight} weight ${types.weight === 1 ? 'entry' : 'entries'}\n`;
    }
    
    if (types.diet > 0) {
      tooltip += `• ${types.diet} diet ${types.diet === 1 ? 'entry' : 'entries'}\n`;
    }
    
    if (types.workout > 0) {
      tooltip += `• ${types.workout} workout ${types.workout === 1 ? 'entry' : 'entries'}`;
    }
    
    return tooltip;
  };
  
  // Prepare cells data for rendering
  const heatmapCells = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Generate array of all dates in our range
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group dates by week
    const weeks = {};
    dates.forEach(date => {
      const weekNum = getWeekNumber(date);
      const year = date.getFullYear();
      const weekKey = `${year}-${weekNum}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push(date);
    });
    
    // Sort week keys
    const sortedWeekKeys = Object.keys(weeks).sort((a, b) => {
      const [yearA, weekA] = a.split('-').map(Number);
      const [yearB, weekB] = b.split('-').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return weekA - weekB;
    });
    
    return sortedWeekKeys.map(weekKey => {
      const datesInWeek = weeks[weekKey];
      
      // Fill in missing days to always have 7 days per week
      const filledDates = Array(7).fill(null);
      
      datesInWeek.forEach(date => {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday, ..., 6 = Sunday
        filledDates[adjustedIndex] = date;
      });
      
      return {
        weekKey,
        dates: filledDates
      };
    });
  }, []);
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1rem',
      overflow: 'hidden'
    }}>
      {/* Month headers */}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '35px' }}></div> {/* Space for weekday labels */}
        <div style={{ display: 'flex', width: 'calc(100% - 35px)' }}>
          {monthData.map((month, idx) => (
            <div key={idx} style={{ 
              textAlign: 'center',
              width: `${(month.columns / 53) * 100}%`, // Width proportional to column count
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {month.name}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', marginTop: '4px' }}>
        {/* Day labels - GitHub style with 7 rows */}
        <div style={{ 
          width: '35px', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '4px'
        }}>
          {weekdayLabels.map((day, index) => (
            <div 
              key={index} 
              style={{ 
                height: '13px', // Smaller, GitHub-like squares
                fontSize: '0.7rem',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                color: 'var(--text-secondary)',
                marginTop: index === 0 ? '0' : '2px', // Space between rows
                marginBottom: index === 6 ? '0' : '2px'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* GitHub-style heatmap grid */}
        <div style={{ display: 'flex', width: 'calc(100% - 35px)' }}>
          {heatmapCells.map((week) => (
            <div key={week.weekKey} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '2px',
              padding: '0 1px',
              width: `${(1 / heatmapCells.length) * 100}%` // Evenly distribute columns
            }}>
              {/* 7 rows for each day of the week */}
              {Array(7).fill(0).map((_, rowIdx) => {
                const date = week.dates[rowIdx];
                const dateKey = date ? date.toISOString().slice(0, 10) : null;
                const activity = dateKey && heatmapData[dateKey];
                const intensity = activity ? activity.intensity : 0;
                
                return (
                  <div 
                    key={rowIdx} 
                    title={dateKey ? getTooltipText(dateKey, activity) : 'No data'}
                    style={{
                      width: '100%', 
                      paddingBottom: '100%', // Square aspect ratio
                      position: 'relative',
                      borderRadius: '2px',
                      backgroundColor: dateKey ? getCellColor(intensity) : 'transparent',
                      marginTop: rowIdx === 0 ? '0' : '2px', // Space between rows
                      marginBottom: rowIdx === 6 ? '0' : '2px',
                      cursor: activity && activity.count > 0 ? 'pointer' : 'default'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        marginTop: '8px',
        gap: '8px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <div 
            key={intensity}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: getCellColor(intensity)
            }}
          />
        ))}
        <span>More</span>
      </div>
      
      {/* Entry Type Indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '8px',
        gap: '12px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--primary)" stroke="none">
            <circle cx="12" cy="12" r="12"></circle>
          </svg>
          <span>Weight</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--primary)" stroke="none">
            <rect x="0" y="0" width="24" height="24"></rect>
          </svg>
          <span>Diet</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--primary)" stroke="none">
            <polygon points="12 0, 24 24, 0 24"></polygon>
          </svg>
          <span>Workout</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;