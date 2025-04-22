// server.js - Express server for Stepie app
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database-utils');

// Create the app
const app = express();
const PORT = process.env.PORT || 3000;

// Database path
const DB_PATH = path.join(__dirname, 'stepie.db');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Helper to initialize DB connection
function getDb() {
  // Create database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    console.log('Database file not found. Initializing...');
    initDatabase();
  }
  
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    }
  });
}

// API Routes
// ==========

// Weight Entries
// -------------
// Get all weight entries for a user
app.get('/api/weight_entries', (req, res) => {
  const userId = req.query.user_id || 1; // Default to user 1 if none provided
  
  const db = getDb();
  db.all(
    'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date ASC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
  db.close();
});

// Add a new weight entry
app.post('/api/weight_entries', (req, res) => {
  const { user_id = 1, weight, date } = req.body;
  
  if (!weight || !date) {
    return res.status(400).json({ error: 'Weight and date are required' });
  }
  
  const db = getDb();
  db.run(
    'INSERT INTO weight_entries (user_id, weight, date) VALUES (?, ?, ?)',
    [user_id, weight, date],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created entry with its ID
      db.get(
        'SELECT * FROM weight_entries WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// Update a weight entry
app.put('/api/weight_entries/:id', (req, res) => {
  const { id } = req.params;
  const { weight, date } = req.body;
  
  if (!weight || !date) {
    return res.status(400).json({ error: 'Weight and date are required' });
  }
  
  const db = getDb();
  db.run(
    'UPDATE weight_entries SET weight = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [weight, date, id],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Entry not found' });
        return;
      }
      
      db.get(
        'SELECT * FROM weight_entries WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a weight entry
app.delete('/api/weight_entries/:id', (req, res) => {
  const { id } = req.params;
  
  const db = getDb();
  db.run(
    'DELETE FROM weight_entries WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Entry not found' });
        return;
      }
      
      res.status(204).send();
    }
  );
});

// User Goals
// ----------
// Get goals for a user
app.get('/api/user_goals', (req, res) => {
  const userId = req.query.user_id || 1;
  
  const db = getDb();
  db.get(
    'SELECT * FROM user_goals WHERE user_id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Parse additionalGoals JSON if it exists
      if (row && row.additionalGoals) {
        try {
          row.additionalGoals = JSON.parse(row.additionalGoals);
        } catch (e) {
          console.error('Error parsing additionalGoals JSON:', e);
          row.additionalGoals = [];
        }
      }
      
      res.json(row || null);
    }
  );
  db.close();
});

// Create or update goals
app.post('/api/user_goals', (req, res) => {
  const { user_id = 1, targetWeight, stepSize = 5, weight_unit = 'lbs', additionalGoals = [] } = req.body;
  
  // Convert additionalGoals to JSON string if it's an array or object
  const additionalGoalsJson = typeof additionalGoals === 'object' 
    ? JSON.stringify(additionalGoals) 
    : additionalGoals;
  
  const db = getDb();
  
  // Check if a goal record already exists for this user
  db.get(
    'SELECT id FROM user_goals WHERE user_id = ?',
    [user_id],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      
      if (row) {
        // Update existing record
        db.run(
          `UPDATE user_goals SET 
          targetWeight = ?, 
          stepSize = ?, 
          weight_unit = ?, 
          additionalGoals = ?,
          updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
          [targetWeight, stepSize, weight_unit, additionalGoalsJson, user_id],
          function(err) {
            if (err) {
              console.error('Database error:', err.message);
              res.status(500).json({ error: err.message });
              db.close();
              return;
            }
            
            // Return updated record
            db.get(
              'SELECT * FROM user_goals WHERE user_id = ?',
              [user_id],
              (err, updatedRow) => {
                if (err) {
                  console.error('Database error:', err.message);
                  res.status(500).json({ error: err.message });
                } else {
                  // Parse additionalGoals JSON
                  if (updatedRow && updatedRow.additionalGoals) {
                    try {
                      updatedRow.additionalGoals = JSON.parse(updatedRow.additionalGoals);
                    } catch (e) {
                      updatedRow.additionalGoals = [];
                    }
                  }
                  res.json(updatedRow);
                }
                db.close();
              }
            );
          }
        );
      } else {
        // Insert new record
        db.run(
          `INSERT INTO user_goals (
            user_id, targetWeight, stepSize, weight_unit, additionalGoals
          ) VALUES (?, ?, ?, ?, ?)`,
          [user_id, targetWeight, stepSize, weight_unit, additionalGoalsJson],
          function(err) {
            if (err) {
              console.error('Database error:', err.message);
              res.status(500).json({ error: err.message });
              db.close();
              return;
            }
            
            // Return created record
            db.get(
              'SELECT * FROM user_goals WHERE id = ?',
              [this.lastID],
              (err, newRow) => {
                if (err) {
                  console.error('Database error:', err.message);
                  res.status(500).json({ error: err.message });
                } else {
                  // Parse additionalGoals JSON
                  if (newRow && newRow.additionalGoals) {
                    try {
                      newRow.additionalGoals = JSON.parse(newRow.additionalGoals);
                    } catch (e) {
                      newRow.additionalGoals = [];
                    }
                  }
                  res.status(201).json(newRow);
                }
                db.close();
              }
            );
          }
        );
      }
    }
  );
});

// Catch-all route to serve the React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize database if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    console.log('Database file not found. Initializing...');
    initDatabase();
  }
});