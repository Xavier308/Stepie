// database-utils.js - Database management utilities
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Database path
const DB_PATH = path.join(__dirname, 'stepie.db');

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize database with schema
function initDatabase() {
  console.log('Initializing database...');
  
  // Read SQL from init-database.sql
  const initSql = fs.readFileSync(path.join(__dirname, 'init-database.sql'), 'utf8');
  
  // Connect to database (will create if doesn't exist)
  const db = new sqlite3.Database(DB_PATH);
  
  // Run initialization SQL
  db.exec(initSql, (err) => {
    if (err) {
      console.error('Error initializing database:', err.message);
    } else {
      console.log('Database initialized successfully!');
    }
    
    // Close database connection
    db.close();
  });
}

// Seed the database with sample data
function seedDatabase() {
  console.log('Seeding database with sample data...');
  
  const db = new sqlite3.Database(DB_PATH);
  
  // Begin transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Check if default user exists
    db.get('SELECT id FROM users WHERE id = 1', (err, row) => {
      if (err) {
        console.error('Error checking for default user:', err.message);
        db.run('ROLLBACK');
        db.close();
        return;
      }
      
      // If no default user, create one
      if (!row) {
        db.run('INSERT INTO users (id, username, email) VALUES (1, "default_user", "user@example.com")');
      }
      
      // Generate sample weight data (losing weight pattern over 3 months)
      const startWeight = 210;
      const endWeight = 185;
      const days = 90;
      const weightChange = startWeight - endWeight;
      
      // Clear existing weight entries for user 1
      db.run('DELETE FROM weight_entries WHERE user_id = 1', function(err) {
        if (err) {
          console.error('Error clearing existing weight entries:', err.message);
          db.run('ROLLBACK');
          db.close();
          return;
        }
        
        const today = new Date();
        const stmt = db.prepare('INSERT INTO weight_entries (user_id, weight, date) VALUES (?, ?, ?)');
        
        for (let i = days; i >= 0; i -= 3) { // Every 3 days
          const entryDate = new Date();
          entryDate.setDate(today.getDate() - i);
          
          // Calculate weight with randomness
          const progress = 1 - (i / days);
          const exactWeight = startWeight - (weightChange * progress);
          const weight = Math.round(exactWeight + (Math.random() * 2 - 1) * 1.5);
          
          stmt.run(1, weight, entryDate.toISOString().slice(0, 10));
        }
        
        stmt.finalize();
        
        // Set default goal
        db.run(`INSERT OR REPLACE INTO user_goals 
                (user_id, targetWeight, stepSize, weight_unit) 
                VALUES (1, 175, 5, 'lbs')`, function(err) {
          if (err) {
            console.error('Error setting default goal:', err.message);
            db.run('ROLLBACK');
          } else {
            db.run('COMMIT');
            console.log('Database seeded successfully with sample data!');
          }
          
          db.close();
        });
      });
    });
  });
}

// Show database status
function showStatus() {
  console.log('Database status:');
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.serialize(() => {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.log('Database file does not exist.');
      return;
    }
    
    // Check tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error checking tables:', err.message);
        return;
      }
      
      console.log('Tables in database:', tables.map(t => t.name).join(', '));
      
      // Count rows in each table
      tables.forEach(table => {
        if (table.name.startsWith('sqlite_')) return; // Skip SQLite internal tables
        
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
          if (err) {
            console.error(`Error counting rows in ${table.name}:`, err.message);
          } else {
            console.log(`- ${table.name}: ${result.count} rows`);
          }
        });
      });
    });
  });
  
  // Don't close immediately to allow async operations to complete
  setTimeout(() => {
    db.close();
    process.exit(0);
  }, 1000);
}

// Reset database (drop all and reinitialize)
function resetDatabase() {
  rl.question('WARNING: This will delete all data. Are you sure? (y/N) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('Resetting database...');
      
      // Delete the database file if it exists
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log('Database file deleted.');
      }
      
      // Reinitialize the database
      initDatabase();
    } else {
      console.log('Database reset cancelled.');
    }
    
    rl.close();
  });
}

// Main function to handle command line arguments
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch(command) {
    case 'init':
      initDatabase();
      break;
    case 'seed':
      seedDatabase();
      break;
    case 'status':
      showStatus();
      break;
    case 'reset':
      resetDatabase();
      break;
    default:
      console.log(`
Usage: node database-utils.js <command>

Commands:
  init    - Initialize the database with schema
  seed    - Add sample data to the database
  status  - Show database status and counts
  reset   - Delete and reinitialize the database (WARNING: deletes all data)
      `);
      process.exit(0);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  initDatabase,
  seedDatabase,
  resetDatabase,
  showStatus
};