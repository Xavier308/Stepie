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

-- Create diet_entries table
CREATE TABLE IF NOT EXISTS diet_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_item TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create workout_entries table
CREATE TABLE IF NOT EXISTS workout_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_diet_entries_user_id ON diet_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_entries_date ON diet_entries(date);
CREATE INDEX IF NOT EXISTS idx_workout_entries_user_id ON workout_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_date ON workout_entries(date);
