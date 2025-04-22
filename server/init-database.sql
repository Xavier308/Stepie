-- SQLite database initialization for Stepie app

-- Drop tables if they exist for clean restart
DROP TABLE IF EXISTS weight_entries;
DROP TABLE IF EXISTS user_goals;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weight_entries table
CREATE TABLE weight_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  weight REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create user_goals table
CREATE TABLE user_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  targetWeight REAL,
  stepSize INTEGER DEFAULT 5,
  weight_unit TEXT DEFAULT 'lbs',
  additionalGoals TEXT, -- Stored as JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create indexes for better performance
CREATE INDEX idx_weight_entries_user_id ON weight_entries (user_id);
CREATE INDEX idx_weight_entries_date ON weight_entries (date);
CREATE INDEX idx_user_goals_user_id ON user_goals (user_id);

-- Insert a default user for development
INSERT INTO users (username, email) VALUES ('default_user', 'user@example.com');

-- Insert a default goal for the user
INSERT INTO user_goals (user_id, targetWeight, stepSize, weight_unit) 
VALUES (1, NULL, 5, 'lbs');