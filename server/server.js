// server.js - Express server with SQLite database and integrated database browser
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const createDatabaseBrowser = require('./database-browser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

// Initialize database
async function initializeDatabase() {
  try {
    // Open SQLite database (creates it if it doesn't exist)
    db = await open({
      filename: path.resolve(__dirname, 'stepie.db'),
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database');

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS weight_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS user_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        targetWeight REAL,
        stepSize INTEGER DEFAULT 5,
        weight_unit TEXT DEFAULT 'lbs',
        additionalGoals TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Insert default user if none exists (for single-user operation initially)
    const userExists = await db.get('SELECT id FROM users LIMIT 1');
    if (!userExists) {
      await db.run('INSERT INTO users (username) VALUES (?)', ['default_user']);
      console.log('Created default user');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// ============== Weight Entries API ==============

// Get all weight entries for a user
app.get('/api/weight_entries', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user 1 for now
    const entries = await db.all(
      'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date ASC',
      [userId]
    );
    res.json(entries);
  } catch (err) {
    console.error('Error fetching weight entries:', err);
    res.status(500).json({ error: 'Failed to fetch weight entries' });
  }
});

// Add a new weight entry
app.post('/api/weight_entries', async (req, res) => {
  try {
    const { weight, date } = req.body;
    const userId = req.body.user_id || 1; // Default to user 1 for now
    
    // Validate required fields
    if (!weight || !date) {
      return res.status(400).json({ error: 'Weight and date are required' });
    }

    // Current timestamp for created_at and updated_at
    const now = new Date().toISOString();
    
    const result = await db.run(
      'INSERT INTO weight_entries (user_id, weight, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [userId, weight, date, now, now]
    );

    res.status(201).json({
      id: result.lastID,
      user_id: userId,
      weight,
      date,
      created_at: now,
      updated_at: now
    });
  } catch (err) {
    console.error('Error adding weight entry:', err);
    res.status(500).json({ error: 'Failed to add weight entry' });
  }
});

// Update a weight entry
app.put('/api/weight_entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, date } = req.body;
    
    // Validate required fields
    if (!weight && !date) {
      return res.status(400).json({ error: 'At least one field (weight or date) is required' });
    }

    // Current timestamp for updated_at
    const now = new Date().toISOString();
    
    // Get current entry to update only provided fields
    const currentEntry = await db.get('SELECT * FROM weight_entries WHERE id = ?', [id]);
    if (!currentEntry) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }

    // Update only the fields that were provided
    const updateWeight = weight !== undefined ? weight : currentEntry.weight;
    const updateDate = date !== undefined ? date : currentEntry.date;
    
    await db.run(
      'UPDATE weight_entries SET weight = ?, date = ?, updated_at = ? WHERE id = ?',
      [updateWeight, updateDate, now, id]
    );

    // Get the updated entry
    const updatedEntry = await db.get('SELECT * FROM weight_entries WHERE id = ?', [id]);
    res.json(updatedEntry);
  } catch (err) {
    console.error('Error updating weight entry:', err);
    res.status(500).json({ error: 'Failed to update weight entry' });
  }
});

// Delete a weight entry
app.delete('/api/weight_entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if entry exists
    const entry = await db.get('SELECT id FROM weight_entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }
    
    await db.run('DELETE FROM weight_entries WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting weight entry:', err);
    res.status(500).json({ error: 'Failed to delete weight entry' });
  }
});

// ============== User Goals API ==============

// Get goals for a user
app.get('/api/user_goals', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user 1 for now
    
    // Try to find existing goals
    let goals = await db.get('SELECT * FROM user_goals WHERE user_id = ?', [userId]);
    
    if (!goals) {
      // No goals found, return empty
      return res.json(null);
    }
    
    // Parse additionalGoals JSON if it exists
    if (goals.additionalGoals) {
      try {
        goals.additionalGoals = JSON.parse(goals.additionalGoals);
      } catch (e) {
        console.warn(`Could not parse additionalGoals for user ${userId}`);
        goals.additionalGoals = [];
      }
    } else {
      goals.additionalGoals = [];
    }
    
    res.json(goals);
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create or update goals
app.post('/api/user_goals', async (req, res) => {
  try {
    const userId = req.body.user_id || 1; // Default to user 1 for now
    const { targetWeight, stepSize, weight_unit, additionalGoals } = req.body;
    
    // Current timestamp
    const now = new Date().toISOString();
    
    // Check if goals already exist for user
    const existingGoals = await db.get('SELECT id FROM user_goals WHERE user_id = ?', [userId]);
    
    // Prepare additionalGoals as JSON string
    const additionalGoalsJson = additionalGoals ? JSON.stringify(additionalGoals) : null;
    
    if (existingGoals) {
      // Update existing goals
      await db.run(
        `UPDATE user_goals 
         SET targetWeight = ?, stepSize = ?, weight_unit = ?, additionalGoals = ?, updated_at = ? 
         WHERE user_id = ?`,
        [targetWeight, stepSize || 5, weight_unit || 'lbs', additionalGoalsJson, now, userId]
      );
      
      // Get updated goals
      const updatedGoals = await db.get('SELECT * FROM user_goals WHERE user_id = ?', [userId]);
      
      // Parse additionalGoals for response
      if (updatedGoals.additionalGoals) {
        try {
          updatedGoals.additionalGoals = JSON.parse(updatedGoals.additionalGoals);
        } catch (e) {
          updatedGoals.additionalGoals = [];
        }
      }
      
      res.json(updatedGoals);
    } else {
      // Create new goals
      const result = await db.run(
        `INSERT INTO user_goals 
         (user_id, targetWeight, stepSize, weight_unit, additionalGoals, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, targetWeight, stepSize || 5, weight_unit || 'lbs', additionalGoalsJson, now, now]
      );
      
      res.status(201).json({
        id: result.lastID,
        user_id: userId,
        targetWeight,
        stepSize: stepSize || 5,
        weight_unit: weight_unit || 'lbs',
        additionalGoals: additionalGoals || [],
        created_at: now,
        updated_at: now
      });
    }
  } catch (err) {
    console.error('Error creating/updating goals:', err);
    res.status(500).json({ error: 'Failed to create/update goals' });
  }
});

// ============== Database Browser ==============
// Only enable in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use('/db-browser', (req, res, next) => {
    // Simple authentication - using a query parameter for simplicity
    // In a real application, you'd want more secure authentication
    const dbPassword = process.env.DB_BROWSER_PASSWORD || 'stepie-admin';
    const providedPassword = req.query.key;
    
    if (providedPassword === dbPassword) {
      next();
    } else {
      res.status(401).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Database Browser - Authentication</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 500px;
                margin: 0 auto;
                padding: 2rem;
                text-align: center;
              }
              h1 { color: #FFA000; }
              input, button {
                padding: 0.5rem;
                margin: 0.5rem;
                width: 100%;
                box-sizing: border-box;
              }
              button {
                background-color: #FFA000;
                color: white;
                border: none;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <h1>Database Browser</h1>
            <form action="/db-browser/" method="get">
              <input type="password" name="key" placeholder="Enter access key" required />
              <button type="submit">Access Database</button>
            </form>
          </body>
        </html>
      `);
    }
  });
  
  // Initialize and use the database browser
  app.use('/db-browser', createDatabaseBrowser(db));
  console.log('Database browser enabled at /db-browser');
}

// Development static file serving for the frontend
if (process.env.NODE_ENV !== 'production') {
  // Serve the frontend build for all other routes
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Serve index.html for any other requests to support client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Database browser available at http://localhost:${PORT}/db-browser?key=stepie-admin`);
    }
  });
});