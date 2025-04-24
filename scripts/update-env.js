// Script to update .env file with Pinata credentials
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to .env file
const envPath = path.join(__dirname, '../.env');

// Pinata credentials to add
const pinataApiKey = 'e2cac84c2e10241553c0';
const pinataApiSecret = '5bd3ba61346efb70c7267627d4a243ff5e45835806db58d1ab38f4ed14601eea';

try {
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if Pinata credentials already exist
  const hasApiKey = envContent.includes('PINATA_API_KEY=');
  const hasApiSecret = envContent.includes('PINATA_API_SECRET=');

  // Update or add credentials
  if (hasApiKey) {
    envContent = envContent.replace(/PINATA_API_KEY=.*/g, `PINATA_API_KEY=${pinataApiKey}`);
  } else {
    envContent += `\nPINATA_API_KEY=${pinataApiKey}`;
  }

  if (hasApiSecret) {
    envContent = envContent.replace(/PINATA_API_SECRET=.*/g, `PINATA_API_SECRET=${pinataApiSecret}`);
  } else {
    envContent += `\nPINATA_API_SECRET=${pinataApiSecret}`;
  }

  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Successfully updated .env file with Pinata credentials');
  console.log('You can now run: node scripts/test-pinata.js');
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
