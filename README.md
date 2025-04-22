# Stepie Weight Tracker

A weight tracking application that helps users monitor their progress toward weight goals. This version uses SQLite as the database backend for persistent storage without requiring external services.

## Features

- Track weight entries over time with date recording
- Set target weight goals and break them down into smaller steps
- Visualize progress with an interactive weight chart
- Activity heatmap to show consistency
- Simple, responsive interface with support for both mobile and desktop
- Local SQLite database storage

## 📋 Project Structure

```
stepie-app/
├── index.html
├── package.json
├── README.md
├── vite.config.js
├── eslint.config.js
├── public/
│   ├── vite.svg
│   └── favicon.png (referenced in index.html)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── ActivityHeatmap.jsx
│   │   ├── AddEntryModal.jsx
│   │   ├── DietEntryForm.jsx
│   │   ├── GoalManager.jsx
│   │   ├── InitialSetupFlow.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── WeightChart.jsx
│   │   ├── WeightForm.jsx
│   │   ├── WeightList.jsx
│   │   ├── WeightTracker.jsx
│   │   └── WorkoutEntryForm.jsx
│   └── services/
│       └── apiService.js
└── server/ (referenced in README and package.json)
    ├── server.js
    ├── database-utils.js
    ├── database-browser.js
    ├── migrate-from-nobackend.js
    └── stepie.db (SQLite database file, created on first run)
```

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or newer)
* npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd stepie-app
   ```

2. **Run the setup script:**
   ```bash
   node setup.js
   ```
   This will guide you through setting up environment variables for both the frontend and backend.

3. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

4. **Start the server:**
   ```bash
   # In the server directory
   cd server
   npm run dev
   ```
   The server will run on port 3000 by default.

5. **Start the frontend in a new terminal:**
   ```bash
   npm run dev
   ```
   The frontend will typically start on port 5173.

6. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Database Setup

The SQLite database file (`stepie.db`) will be created automatically in the `server` directory when you first run the application. No additional setup is required.

To initialize the database with sample data:

```bash
# In the server directory
node database-utils.js seed
```

## 🛠️ Working with the SQLite Database

### Database Browser

A built-in database browser is available in development mode at:
```
http://localhost:3000/db-browser?key=stepie-admin
```
(The key will be the value you set during setup)

This browser allows you to:
- View all tables and their schemas
- Browse data records
- Execute custom SQL queries

### Database Utilities

The `database-utils.js` script provides several helpful commands:

```bash
# Display database status
node database-utils.js status

# Add sample data
node database-utils.js seed

# Reset the database (WARNING: Deletes all data)
node database-utils.js reset
```

### Migration from NoCodeBackend

If you were previously using the NoCodeBackend version, you can migrate your data:

```bash
# In the server directory
node migrate-from-nobackend.js
```

The script will prompt you for your NoCodeBackend API details and import the data into SQLite.

## 📊 Database Schema

### users
- `id`: Primary key
- `username`: User's name
- `email`: User's email (optional)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### weight_entries
- `id`: Primary key
- `user_id`: Foreign key referencing users.id
- `weight`: The recorded weight value
- `date`: Date of the weight measurement
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### user_goals
- `id`: Primary key
- `user_id`: Foreign key referencing users.id
- `targetWeight`: The target weight goal
- `stepSize`: Size of mini-goal steps
- `weight_unit`: Unit of measurement (e.g., 'lbs', 'kg')
- `additionalGoals`: JSON string of additional goals
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## 📚 API Reference

### Weight Entries

- `GET /api/weight_entries` - Get all weight entries for a user
- `POST /api/weight_entries` - Add a new weight entry
- `PUT /api/weight_entries/:id` - Update a weight entry
- `DELETE /api/weight_entries/:id` - Delete a weight entry

### User Goals

- `GET /api/user_goals` - Get goals for a user
- `POST /api/user_goals` - Create or update goals

## 🔄 Development Workflow

1. **Make backend changes:**
   - Edit files in the `server` directory
   - The server auto-restarts when you save changes (using nodemon)

2. **Make frontend changes:**
   - Edit components and services in the `src` directory
   - The development server hot-reloads the application

3. **Database changes:**
   - Use the database browser to test SQL queries
   - Implement schema changes in `server.js` and update corresponding endpoints

4. **Build for production:**
   ```bash
   # Build frontend
   npm run build
   
   # Set NODE_ENV=production in server/.env
   # Start the server
   cd server
   npm start
   ```

## 🚀 Deployment

For a basic production deployment:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set `NODE_ENV=production` in `server/.env`

3. Start the server:
   ```bash
   cd server
   npm start
   ```

The Express server will serve both the API and the static frontend files.

## 🔮 Future Enhancements

- User authentication system
- Multiple user support
- Workout and diet tracking integration
- Data export/import functionality
- Progressive Web App capabilities
- Unit and integration tests

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For questions or support, please open an issue in the repository.