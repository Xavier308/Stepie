import React, { useState } from 'react';

function WeightForm({ onAddEntry }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !date) {
      alert('Please enter both weight and date.');
      return;
    }
    const newEntry = {
      weight: parseFloat(weight),
      date: date,
    };
    onAddEntry(newEntry);
    setWeight('');
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Weight Entry</h3>
      {/* Using basic responsive grid defined in index.css */}
      <form onSubmit={handleSubmit} className="simple-grid-container">
        <div>
          <label htmlFor="weight" style={{ display: 'block', marginBottom: '5px' }}>
            Weight:
          </label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
            required
            placeholder="e.g., 165.5"
          />
        </div>
        <div>
          <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>
            Date:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        {/* Button aligns itself due to align-items: end in simple-grid-container */}
        <button type="submit" className="button-success">
          Add Entry
        </button>
      </form>
    </div>
  );
}

export default WeightForm;