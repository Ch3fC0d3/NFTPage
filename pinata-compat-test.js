// Compatible Pinata test for your NFT project
const pinataSDK = require('@pinata/sdk');

// Hardcoded credentials for testing
const apiKey = 'ff63bfbcbe84e607a0ea';
const apiSecret = '3dcb181c3fc8ff18ed24fca0fbcd1c63198e3f0ba0ef1b6cc81263d9eed8b7ea';

console.log('Starting Pinata compatibility test...');

// Initialize Pinata client with API keys
const pinata = pinataSDK(apiKey, apiSecret); // Using the format compatible with older SDK versions

// Test authentication
async function testPinata() {
  try {
    console.log('Testing Pinata connection...');
    const authResponse = await pinata.testAuthentication();
    console.log('Authentication successful:', authResponse);
    
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
    
    console.log('\nPinata integration is working correctly!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testPinata();
