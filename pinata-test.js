// Basic Pinata test script
const fs = require('fs');
const path = require('path');

// Load environment variables directly
const apiKey = 'ff63bfbcbe84e607a0ea';
const apiSecret = '3dcb181c3fc8ff18ed24fca0fbcd1c63198e3f0ba0ef1b6cc81263d9eed8b7ea';

console.log('Starting Pinata test with hardcoded credentials...');
console.log(`API Key: ${apiKey.substring(0, 4)}...`);
console.log(`API Secret: ${apiSecret.substring(0, 4)}...`);

// Try to initialize Pinata SDK
try {
  console.log('\nImporting Pinata SDK...');
  const PinataSDK = require('@pinata/sdk');
  console.log('Pinata SDK imported successfully');
  
  console.log('\nInitializing Pinata client...');
  const pinata = new PinataSDK(apiKey, apiSecret);
  console.log('Pinata client initialized');
  
  // Test authentication
  console.log('\nTesting authentication...');
  pinata.testAuthentication()
    .then(result => {
      console.log('Authentication successful:', result);
      
      // If authentication is successful, try to upload a simple JSON
      console.log('\nUploading test metadata to IPFS...');
      const testMetadata = {
        name: 'Test NFT',
        description: 'This is a test NFT metadata',
        test: true,
        timestamp: Date.now()
      };
      
      return pinata.pinJSONToIPFS(testMetadata, {
        pinataMetadata: {
          name: 'test-metadata'
        }
      });
    })
    .then(result => {
      if (result && result.IpfsHash) {
        console.log('\n✅ Test successful! Metadata uploaded to IPFS with hash:', result.IpfsHash);
        console.log(`You can view it at: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        console.log('\nYour Pinata integration is working correctly!');
      }
    })
    .catch(err => {
      console.error('\n❌ Authentication or upload error:', err.message);
    });
} catch (error) {
  console.error('\n❌ Error initializing Pinata:', error.message);
}
