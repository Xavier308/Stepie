import React, { useMemo, useEffect } from 'react';

const ActivityHeatmap = ({ weightEntries = [], dietEntries = [], workoutEntries = [] }) => {
  // Helper: normalize any ISO datetime or raw date string to 'YYYY-MM-DD' by splitting off the time portion.
  // IMPORTANT: Avoid using toISOString() on local dates (which converts to UTC and may shift the day backward!).
  const getDateKey = dateStr => dateStr?.split('T')[0] || null;

  // Build heatmapData for the past year, keyed by 'YYYY-MM-DD'
  const heatmapData = useMemo(() => {
    const activityData = {};
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); start.setHours(0,0,0,0);

    // Initialize every day in the range with zero counts
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate();
      const key = `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
      activityData[key] = { count: 0, types: { weight: 0, diet: 0, workout: 0 }, intensity: 0 };
    }

    // Increment counts per entry type using the safe getDateKey
    [[weightEntries,'weight'], [dietEntries,'diet'], [workoutEntries,'workout']]
      .forEach(([entries, type]) => entries.forEach(e => {
        const key = getDateKey(e.date);
        if (activityData[key]) {
          activityData[key].count++;
          activityData[key].types[type]++;
        }
      }));

    // Bucket into intensity levels
    Object.values(activityData).forEach(day => {
      const c = day.count;
      day.intensity = c >= 4 ? 4 : c;
    });

    return activityData;
  }, [weightEntries, dietEntries, workoutEntries]);

  // Debug: inspect the computed data structure
  useEffect(() => console.log('[Heatmap] data:', heatmapData), [heatmapData]);

  // ISO week number helper
  const getWeekNumber = date => {
    const t = new Date(date);
    const day = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - day + 3);
    const firstThu = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round((t - firstThu) / 604800000);
  };

  // Build an array of week columns mapping to up to 7 days each
  const heatmapCells = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); start.setHours(0,0,0,0);
    const weeks = {};

    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      let w = getWeekNumber(d), wy = d.getFullYear();
      if (d.getMonth() === 11 && w === 1) wy++;
      if (d.getMonth() === 0 && w > 50) wy--;
      const key = `${wy}-W${String(w).padStart(2,'0')}`;
      if (!weeks[key]) weeks[key] = Array(7).fill(null);
      weeks[key][(d.getDay() + 6) % 7] = new Date(d);
    }

    return Object.keys(weeks).sort().map(k => ({ weekKey: k, days: weeks[k] }));
  }, [heatmapData]);

  const cellSize = 13, cellGap = 2;
  const colors = ['#EEEEEE','rgba(255,160,0,0.3)','rgba(255,160,0,0.5)','rgba(255,160,0,0.7)','rgba(255,160,0,0.9)'];

  // Format month labels so they align with the first week cell of each month
  const formatMonth = date => date.toLocaleString('en-US', { month: 'short' });

  return (
    <div style={{ backgroundColor:'#fff', padding:'1rem', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Month headers: show label only when month changes from the previous week */}
      <div style={{ display:'flex', paddingLeft:`${cellSize + cellGap}px`, marginBottom:4 }}>
        {heatmapCells.map(({ days }, i) => {
          const firstDate = days.find(Boolean);
          const prevMonth = i > 0 && heatmapCells[i - 1].days.find(Boolean)?.getMonth();
          const thisMonth = firstDate?.getMonth();
          return (
            <div key={i} style={{ width:cellSize, marginRight:cellGap, textAlign:'center', fontSize:12, color:'#666' }}>
              {thisMonth !== prevMonth && firstDate ? formatMonth(firstDate) : ''}
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex' }}>
        {/* Weekday labels */}
        <div style={{ width:cellSize+cellGap, display:'flex', flexDirection:'column', justifyContent:'space-between', paddingRight:4, fontSize:10, color:'#666' }}>
          {['','Mon','','Wed','','Fri',''].map((lbl, idx) => <div key={idx} style={{ height:cellSize }}>{lbl}</div>)}
        </div>

        {/* Heatmap grid */}
        <div style={{ display:'flex' }}>
          {heatmapCells.map(({ weekKey, days }) => (
            <div key={weekKey} style={{ display:'flex', flexDirection:'column', gap:cellGap, marginRight:cellGap }}>
              {days.map((d, idx) => {
                const key = d ? getDateKey(d.toISOString()) : null;
                const intensity = d ? heatmapData[key]?.intensity ?? 0 : 0;
                return (
                  <div
                    key={idx}
                    title={d ? `${heatmapData[key].count} entries on ${d.toLocaleDateString()}` : ''}
                    style={{ width:cellSize, height:cellSize, borderRadius:2, backgroundColor: d ? colors[intensity] : 'transparent' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, fontSize:12, color:'#666' }}>
        <span>Less</span>
        {colors.map((c, i) => <div key={i} style={{ width:10, height:10, backgroundColor:c, borderRadius:2 }} />)}
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
