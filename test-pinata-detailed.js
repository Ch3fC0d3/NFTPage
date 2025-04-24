// Detailed test script for Pinata connection
require('dotenv').config();

// First, let's check if the environment variables are set
console.log('Checking Pinata environment variables...');
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('❌ Pinata API credentials not found in .env file');
  console.log('Please make sure your .env file contains:');
  console.log('PINATA_API_KEY=your-api-key');
  console.log('PINATA_API_SECRET=your-api-secret');
  process.exit(1);
}

console.log('✅ Pinata environment variables found');
console.log(`API Key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
console.log(`API Secret: ${apiSecret.substring(0, 3)}...${apiSecret.substring(apiSecret.length - 3)}`);

// Now let's try to connect to Pinata
const pinataSDK = require('@pinata/sdk');

async function testPinataConnection() {
  try {
    console.log('\nInitializing Pinata client...');
    const pinata = new pinataSDK({
      pinataApiKey: apiKey,
      pinataSecretApiKey: apiSecret
    });
    
    console.log('Testing Pinata authentication...');
    const result = await pinata.testAuthentication();
    
    console.log('\n✅ Pinata connection successful!');
    console.log('Response from Pinata:', JSON.stringify(result, null, 2));
    
    // Get pin list to verify we can access data
    console.log('\nFetching your pinned files (up to 5)...');
    const pins = await pinata.pinList({
      pageLimit: 5
    });
    
    if (pins && pins.rows && pins.rows.length > 0) {
      console.log(`Found ${pins.count} pinned items. Here are up to 5:`);
      pins.rows.forEach((pin, index) => {
        console.log(`\n[${index + 1}] ${pin.metadata.name || 'Unnamed pin'}`);
        console.log(`  - IPFS Hash: ${pin.ipfs_pin_hash}`);
        console.log(`  - Size: ${formatBytes(pin.size)}`);
        console.log(`  - Pinned: ${new Date(pin.date_pinned).toLocaleString()}`);
      });
    } else {
      console.log('No pinned files found in your account.');
    }
    
    console.log('\n🎉 Your Pinata account is properly configured and working!');
  } catch (error) {
    console.error('\n❌ Error connecting to Pinata:');
    console.error(error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\nThe API key appears to be invalid. Please check your Pinata dashboard for the correct key.');
    } else if (error.message.includes('Invalid API secret')) {
      console.log('\nThe API secret appears to be invalid. Please check your Pinata dashboard for the correct secret.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\nNetwork error. Please check your internet connection.');
    }
  }
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the test
testPinataConnection();
