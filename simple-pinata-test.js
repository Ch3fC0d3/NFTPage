// Simple Pinata test script
console.log('Starting simple Pinata test...');

// Load environment variables
require('dotenv').config();
console.log('Loaded dotenv');

// Check if environment variables are available
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;

console.log('API Key available:', !!apiKey);
console.log('API Secret available:', !!apiSecret);

if (apiKey && apiSecret) {
  console.log('API Key (first 4 chars):', apiKey.substring(0, 4));
  console.log('API Secret (first 4 chars):', apiSecret.substring(0, 4));
}

// Try to initialize Pinata SDK
try {
  console.log('\nImporting Pinata SDK...');
  const PinataSDK = require('@pinata/sdk');
  console.log('Pinata SDK imported successfully');
  
  console.log('\nInitializing Pinata client...');
  const pinata = new PinataSDK({
    pinataApiKey: apiKey,
    pinataSecretApiKey: apiSecret
  });
  console.log('Pinata client initialized');
  
  // Test authentication
  console.log('\nTesting authentication...');
  pinata.testAuthentication()
    .then(result => {
      console.log('Authentication successful:', result);
    })
    .catch(err => {
      console.error('Authentication error:', err.message);
    });
} catch (error) {
  console.error('Error initializing Pinata:', error.message);
}
