// server.js - Express server with SQLite database
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'stepie.db');
const dbExists = fs.existsSync(dbPath);

// Initialize SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1); // Exit if we can't connect to the database
  }
  console.log('Connected to SQLite database');
});

// Create database tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Weight entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      weight REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // User goals table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      targetWeight REAL,
      stepSize INTEGER DEFAULT 5,
      weight_unit TEXT DEFAULT 'lbs',
      additionalGoals TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Diet entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS diet_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT NOT NULL,
      mealType TEXT NOT NULL,
      foodItem TEXT NOT NULL,
      calories INTEGER,
      protein INTEGER,
      carbs INTEGER,
      fat INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Workout entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT NOT NULL,
      workoutType TEXT NOT NULL,
      duration INTEGER,
      intensity TEXT,
      caloriesBurned INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // If it's a new database, create default user
  if (!dbExists) {
    db.run(`INSERT INTO users (username) VALUES (?)`, ['default']);
    console.log('Created default user');
  }
});

// API routes
const API_PREFIX = '/api';

// --- Weight Entries Routes ---

// Get all weight entries for a user
app.get(`${API_PREFIX}/weight_entries`, (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id parameter' });
  }

  db.all(
    'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date',
    [user_id],
    (err, rows) => {
      if (err) {
        console.error('Error fetching weight entries:', err);
        return res.status(500).json({ message: 'Failed to fetch weight entries' });
      }
      res.json(rows);
    }
  );
});

// Add a new weight entry
app.post(`${API_PREFIX}/weight_entries`, (req, res) => {
  const { user_id, weight, date } = req.body;

  if (!user_id || !weight || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO weight_entries (user_id, weight, date)
    VALUES (?, ?, ?)
  `;

  db.run(query, [user_id, weight, date], function(err) {
    if (err) {
      console.error('Error adding weight entry:', err);
      return res.status(500).json({ message: 'Failed to add weight entry' });
    }

    // Get the inserted entry to return to client
    db.get(
      'SELECT * FROM weight_entries WHERE id = ?',
      [this.lastID],
      (err, row) => {
        if (err) {
          console.error('Error fetching new weight entry:', err);
          return res.status(500).json({ message: 'Entry created but failed to fetch details' });
        }
        res.status(201).json(row);
      }
    );
  });
});

// Update a weight entry
app.put(`${API_PREFIX}/weight_entries/:id`, (req, res) => {
  const { id } = req.params;
  const { weight, date } = req.body;

  if (!id || (!weight && !date)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    UPDATE weight_entries
    SET 
      ${weight ? 'weight = ?,' : ''}
      ${date ? 'date = ?,' : ''}
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  // Create parameters array based on which fields are provided
  const params = [];
  if (weight) params.push(weight);
  if (date) params.push(date);
  params.push(id);

  // Fix query by removing trailing comma before WHERE
  const fixedQuery = query.replace(/,\s+WHERE/, ' WHERE');

  db.run(fixedQuery, params, function(err) {
    if (err) {
      console.error('Error updating weight entry:', err);
      return res.status(500).json({ message: 'Failed to update weight entry' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    // Get the updated entry to return to client
    db.get(
      'SELECT * FROM weight_entries WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          console.error('Error fetching updated weight entry:', err);
          return res.status(500).json({ message: 'Entry updated but failed to fetch details' });
        }
        res.json(row);
      }
    );
  });
});

// Delete a weight entry
app.delete(`${API_PREFIX}/weight_entries/:id`, (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Missing entry ID' });
  }

  db.run('DELETE FROM weight_entries WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting weight entry:', err);
      return res.status(500).json({ message: 'Failed to delete weight entry' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    res.status(204).send();
  });
});

// --- User Goals Routes ---

// Get goals for a user
app.get(`${API_PREFIX}/user_goals`, (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id parameter' });
  }

  db.get(
    'SELECT * FROM user_goals WHERE user_id = ?',
    [user_id],
    (err, row) => {
      if (err) {
        console.error('Error fetching user goals:', err);
        return res.status(500).json({ message: 'Failed to fetch user goals' });
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
});

// Create or update goals
app.post(`${API_PREFIX}/user_goals`, (req, res) => {
  const { user_id, targetWeight, stepSize, weight_unit, additionalGoals } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id field' });
  }

  // Convert additionalGoals to JSON string if it exists
  const additionalGoalsStr = additionalGoals ? JSON.stringify(additionalGoals) : null;

  // Check if a record already exists for this user
  db.get(
    'SELECT id FROM user_goals WHERE user_id = ?',
    [user_id],
    (err, row) => {
      if (err) {
        console.error('Error checking existing goals:', err);
        return res.status(500).json({ message: 'Failed to process user goals' });
      }

      if (row) {
        // Update existing record
        const query = `
          UPDATE user_goals
          SET 
            targetWeight = ?,
            stepSize = ?,
            weight_unit = ?,
            additionalGoals = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;

        db.run(
          query,
          [targetWeight, stepSize, weight_unit, additionalGoalsStr, user_id],
          function(err) {
            if (err) {
              console.error('Error updating user goals:', err);
              return res.status(500).json({ message: 'Failed to update user goals' });
            }

            // Get the updated record
            db.get(
              'SELECT * FROM user_goals WHERE id = ?',
              [row.id],
              (err, updatedRow) => {
                if (err) {
                  console.error('Error fetching updated user goals:', err);
                  return res.status(500).json({ message: 'Goals updated but failed to fetch details' });
                }

                // Parse additionalGoals JSON if it exists
                if (updatedRow && updatedRow.additionalGoals) {
                  try {
                    updatedRow.additionalGoals = JSON.parse(updatedRow.additionalGoals);
                  } catch (e) {
                    console.error('Error parsing additionalGoals JSON:', e);
                    updatedRow.additionalGoals = [];
                  }
                }

                res.json(updatedRow);
              }
            );
          }
        );
      } else {
        // Insert new record
        const query = `
          INSERT INTO user_goals (user_id, targetWeight, stepSize, weight_unit, additionalGoals)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.run(
          query,
          [user_id, targetWeight, stepSize || 5, weight_unit || 'lbs', additionalGoalsStr],
          function(err) {
            if (err) {
              console.error('Error creating user goals:', err);
              return res.status(500).json({ message: 'Failed to create user goals' });
            }

            // Get the inserted record
            db.get(
              'SELECT * FROM user_goals WHERE id = ?',
              [this.lastID],
              (err, newRow) => {
                if (err) {
                  console.error('Error fetching new user goals:', err);
                  return res.status(500).json({ message: 'Goals created but failed to fetch details' });
                }

                // Parse additionalGoals JSON if it exists
                if (newRow && newRow.additionalGoals) {
                  try {
                    newRow.additionalGoals = JSON.parse(newRow.additionalGoals);
                  } catch (e) {
                    console.error('Error parsing additionalGoals JSON:', e);
                    newRow.additionalGoals = [];
                  }
                }

                res.status(201).json(newRow);
              }
            );
          }
        );
      }
    }
  );
});

// --- Diet Entries Routes ---

// Get all diet entries for a user
app.get(`${API_PREFIX}/diet_entries`, (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id parameter' });
  }

  let query = 'SELECT * FROM diet_entries WHERE user_id = ?';
  const params = [user_id];

  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching diet entries:', err);
      return res.status(500).json({ message: 'Failed to fetch diet entries' });
    }
    res.json(rows);
  });
});

// Add a new diet entry
app.post(`${API_PREFIX}/diet_entries`, (req, res) => {
  const {
    user_id,
    date,
    mealType,
    foodItem,
    calories,
    protein,
    carbs,
    fat
  } = req.body;

  if (!user_id || !date || !mealType || !foodItem) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO diet_entries (
      user_id, date, mealType, foodItem, calories, protein, carbs, fat
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [user_id, date, mealType, foodItem, calories || 0, protein || 0, carbs || 0, fat || 0],
    function(err) {
      if (err) {
        console.error('Error adding diet entry:', err);
        return res.status(500).json({ message: 'Failed to add diet entry' });
      }

      // Get the inserted entry to return to client
      db.get(
        'SELECT * FROM diet_entries WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching new diet entry:', err);
            return res.status(500).json({ message: 'Entry created but failed to fetch details' });
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// Update a diet entry
app.put(`${API_PREFIX}/diet_entries/:id`, (req, res) => {
  const { id } = req.params;
  const { date, mealType, foodItem, calories, protein, carbs, fat } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing entry ID' });
  }

  const query = `
    UPDATE diet_entries
    SET 
      date = COALESCE(?, date),
      mealType = COALESCE(?, mealType),
      foodItem = COALESCE(?, foodItem),
      calories = COALESCE(?, calories),
      protein = COALESCE(?, protein),
      carbs = COALESCE(?, carbs),
      fat = COALESCE(?, fat),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [date, mealType, foodItem, calories, protein, carbs, fat, id],
    function(err) {
      if (err) {
        console.error('Error updating diet entry:', err);
        return res.status(500).json({ message: 'Failed to update diet entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Diet entry not found' });
      }

      // Get the updated entry to return to client
      db.get(
        'SELECT * FROM diet_entries WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated diet entry:', err);
            return res.status(500).json({ message: 'Entry updated but failed to fetch details' });
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a diet entry
app.delete(`${API_PREFIX}/diet_entries/:id`, (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Missing entry ID' });
  }

  db.run('DELETE FROM diet_entries WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting diet entry:', err);
      return res.status(500).json({ message: 'Failed to delete diet entry' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Diet entry not found' });
    }

    res.status(204).send();
  });
});

// --- Workout Entries Routes ---

// Get all workout entries for a user
app.get(`${API_PREFIX}/workout_entries`, (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id parameter' });
  }

  let query = 'SELECT * FROM workout_entries WHERE user_id = ?';
  const params = [user_id];

  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching workout entries:', err);
      return res.status(500).json({ message: 'Failed to fetch workout entries' });
    }
    res.json(rows);
  });
});

// Add a new workout entry
app.post(`${API_PREFIX}/workout_entries`, (req, res) => {
  const {
    user_id,
    date,
    workoutType,
    duration,
    intensity,
    caloriesBurned,
    notes
  } = req.body;

  if (!user_id || !date || !workoutType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO workout_entries (
      user_id, date, workoutType, duration, intensity, caloriesBurned, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [user_id, date, workoutType, duration || 0, intensity || 'medium', caloriesBurned || 0, notes || ''],
    function(err) {
      if (err) {
        console.error('Error adding workout entry:', err);
        return res.status(500).json({ message: 'Failed to add workout entry' });
      }

      // Get the inserted entry to return to client
      db.get(
        'SELECT * FROM workout_entries WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching new workout entry:', err);
            return res.status(500).json({ message: 'Entry created but failed to fetch details' });
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// Update a workout entry
app.put(`${API_PREFIX}/workout_entries/:id`, (req, res) => {
  const { id } = req.params;
  const { date, workoutType, duration, intensity, caloriesBurned, notes } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing entry ID' });
  }

  const query = `
    UPDATE workout_entries
    SET 
      date = COALESCE(?, date),
      workoutType = COALESCE(?, workoutType),
      duration = COALESCE(?, duration),
      intensity = COALESCE(?, intensity),
      caloriesBurned = COALESCE(?, caloriesBurned),
      notes = COALESCE(?, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [date, workoutType, duration, intensity, caloriesBurned, notes, id],
    function(err) {
      if (err) {
        console.error('Error updating workout entry:', err);
        return res.status(500).json({ message: 'Failed to update workout entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Workout entry not found' });
      }

      // Get the updated entry to return to client
      db.get(
        'SELECT * FROM workout_entries WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated workout entry:', err);
            return res.status(500).json({ message: 'Entry updated but failed to fetch details' });
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a workout entry
app.delete(`${API_PREFIX}/workout_entries/:id`, (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Missing entry ID' });
  }

  db.run('DELETE FROM workout_entries WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting workout entry:', err);
      return res.status(500).json({ message: 'Failed to delete workout entry' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Workout entry not found' });
    }

    res.status(204).send();
  });
});

// Serve static files for production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));
  
  // Handle SPA routing - serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown - close database connection
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});