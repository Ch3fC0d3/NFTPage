// Test script for Pinata IPFS pinning
const { uploadFileToPinata, uploadMetadataToPinata, testPinataConnection } = require('../utils/pinata');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function testPinataSetup() {
  console.log('Testing Pinata connection...');
  
  try {
    // Test connection to Pinata
    const isConnected = await testPinataConnection();
    
    if (!isConnected) {
      console.error('❌ Pinata connection failed. Check your API keys in .env file.');
      return;
    }
    
    console.log('✅ Pinata connection successful!');
    
    // Use the test NFT image we created
    const sampleImagePath = path.join(__dirname, '../public/images/test-nft.png');
    
    // Verify the image exists
    if (!fs.existsSync(sampleImagePath)) {
      console.error('❌ Test NFT image not found. Please run: node scripts/create-test-image.js');
      return;
    }
    

    
    console.log(`✅ Found sample image at: ${sampleImagePath}`);
    console.log('Attempting to upload to Pinata...');
    
    try {
      const imageUri = await uploadFileToPinata(sampleImagePath, 'test-nft-image');
      console.log(`✅ Image uploaded successfully to IPFS: ${imageUri}`);
      
      // Create and upload sample metadata
      const metadata = {
        name: 'Test NFT',
        description: 'This is a test NFT created with Pinata',
        image: imageUri,
        attributes: [
          { trait_type: 'Test Attribute', value: 'Test Value' }
        ]
      };
      
      const metadataUri = await uploadMetadataToPinata(metadata, 'test-nft-metadata');
      console.log(`✅ Metadata uploaded successfully to IPFS: ${metadataUri}`);
      console.log('\nYou can view your pinned content in the Pinata Cloud UI: https://app.pinata.cloud/pinmanager');
      
      return { imageUri, metadataUri };
    } catch (uploadError) {
      console.error('❌ Error uploading to IPFS:', uploadError.message);
      console.log('Make sure the sample image path exists or modify it in this script.');
    }
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
  }
}

// Run the test
testPinataSetup()
  .then(() => {
    console.log('\nTest completed.');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
  });
