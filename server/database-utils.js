// database-utils.js - Helper functions for managing the SQLite database
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Helper function to connect to the database
async function openDatabase() {
  return open({
    filename: path.resolve(__dirname, 'stepie.db'),
    driver: sqlite3.Database
  });
}

// Reset the database (WARNING: destroys all data!)
async function resetDatabase() {
  try {
    const db = await openDatabase();
    
    // Drop tables if they exist
    await db.exec(`
      DROP TABLE IF EXISTS weight_entries;
      DROP TABLE IF EXISTS user_goals;
      DROP TABLE IF EXISTS users;
    `);
    
    console.log('Tables dropped successfully');
    
    // Recreate tables
    await db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE weight_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE user_goals (
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
    
    console.log('Tables recreated successfully');
    
    // Insert default user
    await db.run('INSERT INTO users (username) VALUES (?)', ['default_user']);
    console.log('Default user created');
    
    await db.close();
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

// Seed the database with sample data
async function seedDatabase() {
  try {
    const db = await openDatabase();
    
    // Check if default user exists, create if not
    const user = await db.get('SELECT id FROM users WHERE id = 1');
    if (!user) {
      await db.run('INSERT INTO users (id, username) VALUES (?, ?)', [1, 'default_user']);
      console.log('Created default user');
    }
    
    // Create sample weight entries for a 3-month period
    const entries = [];
    const startWeight = 210;
    const endWeight = 185;
    const days = 90;
    const today = new Date();
    
    for (let i = days; i >= 0; i -= 3) {
      const entryDate = new Date();
      entryDate.setDate(today.getDate() - i);
      
      const progress = 1 - (i / days);
      const exactWeight = startWeight - ((startWeight - endWeight) * progress);
      const weight = Math.round(exactWeight + (Math.random() * 2 - 1) * 1.5);
      
      entries.push({
        date: entryDate.toISOString().slice(0, 10),
        weight
      });
    }
    
    // Insert sample weight entries
    for (const entry of entries) {
      await db.run(
        'INSERT INTO weight_entries (user_id, weight, date) VALUES (?, ?, ?)',
        [1, entry.weight, entry.date]
      );
    }
    console.log(`Added ${entries.length} sample weight entries`);
    
    // Add sample goals
    const goalsExist = await db.get('SELECT id FROM user_goals WHERE user_id = 1');
    if (!goalsExist) {
      await db.run(
        'INSERT INTO user_goals (user_id, targetWeight, stepSize, weight_unit) VALUES (?, ?, ?, ?)',
        [1, 175, 5, 'lbs']
      );
      console.log('Added sample user goals');
    }
    
    await db.close();
    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Display database status
async function displayDatabaseStatus() {
  try {
    const db = await openDatabase();
    
    // Check users
    const users = await db.all('SELECT * FROM users');
    console.log(`Users (${users.length}):`);
    console.table(users);
    
    // Check weight entries
    const entries = await db.all('SELECT * FROM weight_entries ORDER BY date');
    console.log(`Weight Entries (${entries.length}):`);
    console.table(entries.slice(0, 5)); // Show first 5 entries
    if (entries.length > 5) {
      console.log(`... and ${entries.length - 5} more entries`);
    }
    
    // Check goals
    const goals = await db.all('SELECT * FROM user_goals');
    console.log(`User Goals (${goals.length}):`);
    console.table(goals);
    
    await db.close();
  } catch (error) {
    console.error('Error displaying database status:', error);
  }
}

// Export functions
module.exports = {
  openDatabase,
  resetDatabase,
  seedDatabase,
  displayDatabaseStatus,
};

// If this script is run directly (node database-utils.js <command>)
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'reset') {
    resetDatabase();
  } else if (command === 'seed') {
    seedDatabase();
  } else if (command === 'status') {
    displayDatabaseStatus();
  } else {
    console.log('Available commands:');
    console.log('- reset: Reset the database (WARNING: Destroys all data!)');
    console.log('- seed: Seed the database with sample data');
    console.log('- status: Display database status');
  }
}