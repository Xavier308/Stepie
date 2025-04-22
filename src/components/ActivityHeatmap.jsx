import React, { useMemo } from 'react';

const ActivityHeatmap = ({ weightEntries = [], dietEntries = [], workoutEntries = [] }) => {
  // Month column distribution following GitHub's pattern
  const monthData = [
    { name: 'Jan', columns: 4 }, { name: 'Feb', columns: 4 }, { name: 'Mar', columns: 5 },
    { name: 'Apr', columns: 5 }, { name: 'May', columns: 4 }, { name: 'Jun', columns: 5 },
    { name: 'Jul', columns: 4 }, { name: 'Aug', columns: 4 }, { name: 'Sep', columns: 5 },
    { name: 'Oct', columns: 4 }, { name: 'Nov', columns: 4 }, { name: 'Dec', columns: 5 }
  ];

  // Day labels with empty slots between main labels (GitHub style)
  const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Process all entries to generate heatmap data
  const heatmapData = useMemo(() => {
    // Initialize empty activity data structure
    const activityData = {};

    // Get current date and set to midnight local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Create date range - we'll show a full year of data ending today (midnight)
    const endDate = today;
    const startDate = new Date(currentYear - 1, today.getMonth(), today.getDate());
    startDate.setHours(0, 0, 0, 0); // Also set start date to midnight

    // For each day in our range, initialize with 0 activity
    let loopDate = new Date(startDate);
    while (loopDate <= endDate) {
      const dateKey = loopDate.toISOString().slice(0, 10);
      activityData[dateKey] = {
        count: 0,
        types: { weight: 0, diet: 0, workout: 0 },
        intensity: 0
      };
      loopDate.setDate(loopDate.getDate() + 1);
    }

    // --- Process Entries with Consistent Date Parsing ---
    weightEntries.forEach(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      const dateKey = entryDate.toISOString().slice(0, 10);
      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.weight += 1;
      }
    });

    dietEntries.forEach(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      const dateKey = entryDate.toISOString().slice(0, 10);
      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.diet += 1;
      }
    });

    workoutEntries.forEach(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      const dateKey = entryDate.toISOString().slice(0, 10);

      const problematicDate = 'YYYY-MM-DD'; // <--- REPLACE with actual date string (e.g., '2024-04-22')

      if (entry.date === problematicDate) {
        console.log(`[heatmapData Debug] Processing workout entry: date=${entry.date}`, entry);
        console.log(`[heatmapData Debug] Parsed Date: ${entryDate}, DateKey: ${dateKey}`);
      }

      if (dateKey in activityData) {
        activityData[dateKey].count += 1;
        activityData[dateKey].types.workout += 1;

        // *** CORRECTED LOG INSIDE LOOP ***
        if (entry.date === problematicDate) {
          // Log the current state of this specific dateKey after adding the entry
          console.log(`[heatmapData Debug] Added to activityData for key ${dateKey}:`, activityData[dateKey]);
        }
        // *** END CORRECTION ***

      } else {
        if (entry.date === problematicDate) {
          console.log(`[heatmapData Debug] SKIPPED workout entry, dateKey ${dateKey} not in range or activityData map.`);
        }
      }
    });

    const problematicDateForFinalCheck = 'YYYY-MM-DD'; // <--- REPLACE with actual date string
    // Correct final check log using 'activityData'
    console.log(`[heatmapData Debug] Final check for key ${problematicDateForFinalCheck} in activityData map:`, activityData[problematicDateForFinalCheck]);


    // Calculate intensity levels (0-4)
    Object.keys(activityData).forEach(dateKey => {
      const count = activityData[dateKey].count;
      if (count === 0) activityData[dateKey].intensity = 0;
      else if (count === 1) activityData[dateKey].intensity = 1;
      else if (count === 2) activityData[dateKey].intensity = 2;
      else if (count === 3) activityData[dateKey].intensity = 3;
      else activityData[dateKey].intensity = 4; // 4 or more
    });

    return activityData;
  }, [weightEntries, dietEntries, workoutEntries]);

  // --- Helper Functions ---
  const getWeekNumber = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const weekNum = 1 + Math.ceil((target.getTime() - firstThursday.getTime()) / 604800000); // Use getTime() for subtraction
    return weekNum;
  };

  const getCellColor = (intensity) => {
    switch(intensity) {
      case 0: return '#EEEEEE';
      case 1: return 'rgba(255, 160, 0, 0.3)';
      case 2: return 'rgba(255, 160, 0, 0.5)';
      case 3: return 'rgba(255, 160, 0, 0.7)';
      case 4: return 'rgba(255, 160, 0, 0.9)';
      default: return '#EEEEEE';
    }
  };

  const getTooltipText = (dateKey, activity) => {
     if (!activity || !dateKey) return 'No data';
     const date = new Date(dateKey + 'T00:00:00');
     if (isNaN(date.getTime())) return 'Invalid date';

     const formattedDate = date.toLocaleDateString('en-US', {
       weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
     });
     const { count, types } = activity;
     if (count === 0) return `No activity on ${formattedDate}`;

     let tooltipLines = [`${count} ${count === 1 ? 'entry' : 'entries'} on ${formattedDate}:`];
     if (types.weight > 0) tooltipLines.push(`• ${types.weight} weight ${types.weight === 1 ? 'entry' : 'entries'}`);
     if (types.diet > 0) tooltipLines.push(`• ${types.diet} diet ${types.diet === 1 ? 'entry' : 'entries'}`);
     if (types.workout > 0) tooltipLines.push(`• ${types.workout} workout ${types.workout === 1 ? 'entry' : 'entries'}`);
     return tooltipLines.join('\n');
   };

  // Prepare cells data for rendering the grid structure
  const heatmapCells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    startDate.setHours(0, 0, 0, 0);

    const dates = [];
    let loopDate = new Date(startDate);
    while (loopDate <= today) {
      dates.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);
    }

    const weeks = {};
    dates.forEach(date => {
      const year = date.getFullYear();
      const weekNum = getWeekNumber(date);
      let weekYear = year;
      if (date.getMonth() === 11 && weekNum === 1) weekYear = year + 1;
      else if (date.getMonth() === 0 && weekNum > 50) weekYear = year - 1;
      const weekKey = `${weekYear}-W${String(weekNum).padStart(2, '0')}`;

      if (!weeks[weekKey]) weeks[weekKey] = Array(7).fill(null);
      const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0, Sun=6
      weeks[weekKey][dayOfWeek] = date;
    });

    const sortedWeekKeys = Object.keys(weeks).sort();
    return sortedWeekKeys.map(weekKey => ({ weekKey, filledDates: weeks[weekKey] }));
  }, []);

  // --- Render Logic ---
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1rem', marginBottom: '1rem', overflow: 'hidden' }}>
      {/* Month Headers */}
      <div style={{ display: 'flex', paddingLeft: '39px', marginBottom: '2px' }}>
        {monthData.map((month, idx) => ( // This is still approximate positioning
          <div key={idx} style={{ width: `${(month.columns / 53) * 100}%`, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '500', textAlign: 'left' }}>
            {month.name}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', marginTop: '4px' }}>
        {/* Day Labels */}
        <div style={{ width: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {weekdayLabels.map((day, index) => (
            <div key={index} style={{ height: '13px', marginBottom: '2px', textAlign: 'right' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: 'flex', width: 'calc(100% - 35px)', gap: '2px' }}>
          {heatmapCells.map(({ weekKey, filledDates }) => (
            <div key={weekKey} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filledDates.map((date, rowIdx) => {
                const dateKey = date ? date.toISOString().slice(0, 10) : null;
                const activity = dateKey ? heatmapData[dateKey] : null;
                const intensity = activity ? activity.intensity : 0;

                const problematicDate = 'YYYY-MM-DD'; // <--- REPLACE with actual date string (e.g., '2024-04-22')
                const checkYear = '2024'; // <--- ADJUST YEAR IF NEEDED

                if (dateKey === problematicDate) {
                   console.log(`[Render Debug] Rendering EXPECTED cell: weekKey=${weekKey}, rowIdx=${rowIdx} (0=Mon), date=${date ? date.toDateString() : 'null'}, dateKey=${dateKey}, activity=`, activity);
                }
                if (dateKey && dateKey.startsWith(`${checkYear}-12`)) { // Check December specifically
                   console.log(`[Render Debug] Rendering Dec Cell: weekKey=${weekKey}, rowIdx=${rowIdx} (0=Mon), date=${date ? date.toDateString() : 'null'}, dateKey=${dateKey}, activity=`, activity);
                   // Check if this Dec cell contains the problematic workout
                   if (activity && activity.types.workout > 0 && activityData[problematicDate]?.types.workout > 0 && dateKey !== problematicDate) {
                      console.warn(`[Render Debug] Mismatched workout! Dec cell ${dateKey} has workout, but should be on ${problematicDate}`, activity);
                   }
                }
                 if (dateKey && dateKey.startsWith(`${checkYear}-11`)) { // Check November specifically
                   console.log(`[Render Debug] Rendering Nov Cell: weekKey=${weekKey}, rowIdx=${rowIdx} (0=Mon), date=${date ? date.toDateString() : 'null'}, dateKey=${dateKey}, activity=`, activity);
                    // Check if this Nov cell contains the problematic workout
                    if (activity && activity.types.workout > 0 && activityData[problematicDate]?.types.workout > 0 && dateKey !== problematicDate) {
                      console.warn(`[Render Debug] Mismatched workout! Nov cell ${dateKey} has workout, but should be on ${problematicDate}`, activity);
                   }
                }


                return (
                  <div
                    key={rowIdx}
                    title={getTooltipText(dateKey, activity)}
                    style={{ width: '13px', height: '13px', borderRadius: '2px', backgroundColor: getCellColor(intensity), cursor: activity && activity.count > 0 ? 'pointer' : 'default' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <div key={intensity} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(intensity) }} />
        ))}
        <span>More</span>
      </div>

      {/* Entry Type Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '8px', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, backgroundColor: 'rgba(255, 160, 0, 0.3)', borderRadius: 2, display: 'inline-block' }}></span>
          <span>Activity Recorded</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;