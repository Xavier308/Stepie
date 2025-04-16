import React, { useState } from 'react';

function WeightList({ entries = [], onUpdateEntry, onDeleteEntry }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({ date: '', weight: '' });

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    // Ensure date is in 'YYYY-MM-DD' format for the input type="date"
    const formattedDate = entry.date instanceof Date ? entry.date.toISOString().slice(0, 10) : String(entry.date).slice(0,10);
    setEditFormData({ date: formattedDate, weight: entry.weight });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingEntry) return;
    onUpdateEntry(editingEntry.id, {
      date: editFormData.date,
      weight: parseFloat(editFormData.weight),
    });
    setEditingEntry(null);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDeleteEntry(id);
    }
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="card mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Entry History</h3>
      {sortedEntries.length === 0 ? (
        <p className="text-gray-500">No entries recorded.</p>
      ) : (
        // Basic table styles applied via index.css
        <div style={{ overflowX: 'auto' }}> {/* Allow horizontal scroll on small screens */}
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  {editingEntry?.id === entry.id ? (
                    // Edit Form Row - Use inline styles for basic layout
                    <tr>
                      <td colSpan="3" style={{ padding: '0' }}>
                        <form onSubmit={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#e7f1ff' }}>
                          <input
                            type="date"
                            name="date"
                            value={editFormData.date}
                            onChange={handleEditFormChange}
                            required
                            style={{ flexGrow: 1, minWidth: '120px', padding: '5px', fontSize: '0.875rem' }}
                          />
                          <input
                            type="number"
                            name="weight"
                            value={editFormData.weight}
                            onChange={handleEditFormChange}
                            step="0.1"
                            required
                            style={{ flexGrow: 1, minWidth: '80px', padding: '5px', fontSize: '0.875rem' }}
                          />
                          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                            <button type="submit" className="button-success" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Save</button>
                            <button type="button" onClick={handleCancelEdit} className="button-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Cancel</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    // Display Row
                    <tr>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.weight}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEditClick(entry)} className="button-link" style={{ marginRight: '5px', fontSize: '0.875rem' }}>Edit</button>
                        <button onClick={() => handleDeleteClick(entry.id)} className="button-link button-danger" style={{ fontSize: '0.875rem' }}>Delete</button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WeightList;