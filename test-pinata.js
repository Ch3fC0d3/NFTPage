// Test script for Pinata connection
const pinataUtils = require('./utils/pinata');

async function testPinataConnection() {
  try {
    console.log('Testing Pinata connection...');
    const isConnected = await pinataUtils.testPinataConnection();
    
    if (isConnected) {
      console.log('✅ Pinata connection successful!');
      console.log('Your Pinata API keys are properly configured.');
    } else {
      console.log('❌ Pinata connection failed.');
      console.log('Please check your API keys in the .env file.');
    }
  } catch (error) {
    console.error('Error testing Pinata connection:', error.message);
  }
}

// Run the test
testPinataConnection();
