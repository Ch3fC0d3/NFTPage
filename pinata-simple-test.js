/**
 * Simple Pinata IPFS Test
 * 
 * This script tests the connection to Pinata IPFS and uploads a simple JSON
 * using the credentials from your .env file.
 */

require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

// Get Pinata credentials from environment variables
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;

console.log('='.repeat(50));
console.log('Pinata IPFS Simple Test');
console.log('='.repeat(50));

// Log credentials (without revealing full secret)
console.log(`\nAPI Key: ${apiKey}`);
console.log(`API Secret: ${apiSecret ? apiSecret.substring(0, 5) + '...' : 'Not found'}`);

// Initialize Pinata client
const pinata = pinataSDK(apiKey, apiSecret);

// Test authentication
async function testPinata() {
  try {
    console.log('\nTesting Pinata connection...');
    const authResponse = await pinata.testAuthentication();
    console.log('Authentication response:', authResponse);
    
    if (authResponse.authenticated) {
      console.log('\n✅ Pinata authentication successful!');
      
      // Upload test metadata
      console.log('\nUploading test metadata...');
      const metadata = {
        name: 'Test NFT',
        description: 'Testing Pinata integration',
        timestamp: new Date().toISOString()
      };
      
      const options = {
        pinataMetadata: {
          name: 'test-nft-metadata'
        }
      };
      
      const result = await pinata.pinJSONToIPFS(metadata, options);
      console.log('\nMetadata uploaded successfully!');
      console.log('IPFS Hash:', result.IpfsHash);
      console.log('View at:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
      
      console.log('\n🎉 Pinata integration is working correctly!');
    } else {
      console.error('\n❌ Pinata authentication failed');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPinata();
