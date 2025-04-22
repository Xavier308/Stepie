// setup.js - Script to help set up the SQLite environment
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Create random secure password
const generatePassword = (length = 12) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Main setup function
async function setup() {
  console.log('\n=== Stepie App Setup ===\n');
  console.log('This script will help you set up your SQLite-based Stepie app environment.\n');
  
  try {
    // Create server directory if it doesn't exist
    if (!fs.existsSync('./server')) {
      console.log('Creating server directory...');
      fs.mkdirSync('./server', { recursive: true });
    }
    
    // Create .env files
    console.log('\nConfiguring environment variables...');
    
    // Root .env file (for frontend)
    const frontendEnvPath = path.resolve('./.env');
    const frontendEnvExists = fs.existsSync(frontendEnvPath);
    
    if (frontendEnvExists) {
      const overwriteFrontend = await prompt('Frontend .env file already exists. Overwrite? (y/n): ');
      if (overwriteFrontend.toLowerCase() !== 'y') {
        console.log('Skipping frontend .env file creation.');
      } else {
        createFrontendEnvFile(frontendEnvPath);
      }
    } else {
      createFrontendEnvFile(frontendEnvPath);
    }
    
    // Server .env file
    const serverEnvPath = path.resolve('./server/.env');
    const serverEnvExists = fs.existsSync(serverEnvPath);
    
    if (serverEnvExists) {
      const overwriteServer = await prompt('Server .env file already exists. Overwrite? (y/n): ');
      if (overwriteServer.toLowerCase() !== 'y') {
        console.log('Skipping server .env file creation.');
      } else {
        await createServerEnvFile(serverEnvPath);
      }
    } else {
      await createServerEnvFile(serverEnvPath);
    }
    
    console.log('\n=== Setup Complete ===');
    console.log('Your environment has been configured for the SQLite-based Stepie app.');
    console.log('\nNext steps:');
    console.log('1. Run `cd server && npm install` to install server dependencies');
    console.log('2. Start the server with `cd server && npm run dev`');
    console.log('3. Start the frontend with `npm run dev` in the project root');
    console.log('\nHappy tracking!');
    
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    rl.close();
  }
}

// Create frontend .env file
function createFrontendEnvFile(filePath) {
  const content = `# Frontend environment variables
VITE_API_BASE_URL=http://localhost:3000/api
`;
  
  fs.writeFileSync(filePath, content);
  console.log('Created frontend .env file');
}

// Create server .env file
async function createServerEnvFile(filePath) {
  const port = await prompt('Enter server port (default: 3000): ') || '3000';
  const nodeEnv = await prompt('Environment (development/production) (default: development): ') || 'development';
  const dbPassword = await prompt('Set database browser password (leave empty for random): ') || generatePassword();
  
  const content = `# Server environment variables
PORT=${port}
NODE_ENV=${nodeEnv}
DB_BROWSER_PASSWORD=${dbPassword}
`;
  
  fs.writeFileSync(filePath, content);
  console.log('Created server .env file');
  
  if (nodeEnv === 'development') {
    console.log(`\nDatabase browser will be available at: http://localhost:${port}/db-browser?key=${dbPassword}`);
  }
}

// Run the setup
setup();