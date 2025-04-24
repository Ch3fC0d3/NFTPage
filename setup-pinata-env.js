// Script to set up Pinata credentials in .env file
const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found!');
  console.log('Creating a new .env file from .env.example...');
  
  // Copy from .env.example if it exists
  const examplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('.env file created from .env.example');
  } else {
    // Create a basic .env file
    fs.writeFileSync(envPath, '# NFT Project Environment Variables\n\n');
    console.log('Created a new empty .env file');
  }
}

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Pinata credentials to add
const pinataApiKey = 'ff63bfbcbe84e607a0ea'; // Replace with your API key
const pinataApiSecret = '3dcb181c3fc8ff18ed24fca0fbcd1c63198e3f0ba0ef1b6cc81263d9eed8b7ea'; // Replace with your API secret

// Update or add Pinata credentials
if (envContent.includes('PINATA_API_KEY=')) {
  // Replace existing credentials
  envContent = envContent.replace(/PINATA_API_KEY=.*/g, `PINATA_API_KEY=${pinataApiKey}`);
  envContent = envContent.replace(/PINATA_API_SECRET=.*/g, `PINATA_API_SECRET=${pinataApiSecret}`);
  console.log('Updated existing Pinata credentials in .env file');
} else {
  // Add new credentials
  envContent += '\n# Pinata IPFS Pinning Service\n';
  envContent += `PINATA_API_KEY=${pinataApiKey}\n`;
  envContent += `PINATA_API_SECRET=${pinataApiSecret}\n`;
  console.log('Added Pinata credentials to .env file');
}

// Write the updated content back to the .env file
fs.writeFileSync(envPath, envContent);

console.log('\n✅ Pinata credentials have been set up in your .env file');
console.log('You can now run the test-pinata-detailed.js script to verify your connection');
