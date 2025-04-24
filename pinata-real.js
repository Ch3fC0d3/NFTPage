/**
 * Pinata IPFS Integration for NFT Project
 * 
 * This script provides utilities for uploading NFT images and metadata to Pinata IPFS.
 * It requires valid Pinata API credentials in your .env file.
 */

require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

// Get Pinata credentials from environment variables
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;

// Validate credentials
if (!apiKey || !apiSecret) {
  console.error('❌ Error: Pinata API credentials not found in .env file');
  console.log('Please add your Pinata credentials to your .env file:');
  console.log('PINATA_API_KEY=your-pinata-api-key');
  console.log('PINATA_API_SECRET=your-pinata-api-secret');
  process.exit(1);
}

// Initialize Pinata client
const pinata = pinataSDK(apiKey, apiSecret);

/**
 * Test connection to Pinata
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    console.log('🔄 Testing Pinata connection...');
    const result = await pinata.testAuthentication();
    
    if (result.authenticated) {
      console.log('✅ Pinata connection successful!');
      return true;
    } else {
      console.error('❌ Pinata authentication failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Pinata connection error:', error.message);
    return false;
  }
}

/**
 * Upload a file to Pinata IPFS
 * @param {string} filePath - Path to the file to upload
 * @param {string} name - Name for the file in Pinata
 * @returns {Promise<string|null>} IPFS hash or null if failed
 */
async function uploadFile(filePath, name) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return null;
    }
    
    console.log(`🔄 Uploading ${name} to Pinata IPFS...`);
    
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: name || path.basename(filePath)
      }
    };
    
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    
    console.log(`✅ File uploaded to IPFS with hash: ${result.IpfsHash}`);
    console.log(`🌐 View at: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Error uploading file to Pinata:', error.message);
    return null;
  }
}

/**
 * Upload JSON metadata to Pinata IPFS
 * @param {Object} metadata - JSON metadata to upload
 * @param {string} name - Name for the metadata in Pinata
 * @returns {Promise<string|null>} IPFS hash or null if failed
 */
async function uploadMetadata(metadata, name) {
  try {
    console.log(`🔄 Uploading metadata for ${name} to Pinata IPFS...`);
    
    const options = {
      pinataMetadata: {
        name: name || `NFT Metadata ${Date.now()}`
      }
    };
    
    const result = await pinata.pinJSONToIPFS(metadata, options);
    
    console.log(`✅ Metadata uploaded to IPFS with hash: ${result.IpfsHash}`);
    console.log(`🌐 View at: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Error uploading metadata to Pinata:', error.message);
    return null;
  }
}

/**
 * Create and upload complete NFT (image + metadata) to IPFS
 * @param {string} imagePath - Path to the NFT image
 * @param {Object} attributes - NFT attributes for metadata
 * @returns {Promise<Object|null>} Object with image and metadata hashes, or null if failed
 */
async function createNFT(imagePath, attributes = {}) {
  try {
    // First upload the image
    const fileName = path.basename(imagePath);
    const imageHash = await uploadFile(imagePath, fileName);
    
    if (!imageHash) {
      throw new Error('Failed to upload image');
    }
    
    // Create metadata with the image IPFS link
    const metadata = {
      name: attributes.name || `NFT ${Date.now()}`,
      description: attributes.description || 'An NFT created with Pinata IPFS',
      image: `ipfs://${imageHash}`,
      attributes: attributes.traits || [],
      created_at: new Date().toISOString()
    };
    
    // Upload the metadata
    const metadataHash = await uploadMetadata(metadata, metadata.name);
    
    if (!metadataHash) {
      throw new Error('Failed to upload metadata');
    }
    
    return {
      image: {
        hash: imageHash,
        url: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        ipfsUrl: `ipfs://${imageHash}`
      },
      metadata: {
        hash: metadataHash,
        url: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        ipfsUrl: `ipfs://${metadataHash}`
      }
    };
  } catch (error) {
    console.error('❌ Error creating NFT:', error.message);
    return null;
  }
}

// Export functions
module.exports = {
  testConnection,
  uploadFile,
  uploadMetadata,
  createNFT
};

// If script is run directly, test the connection
if (require.main === module) {
  (async () => {
    console.log('='.repeat(50));
    console.log('Pinata IPFS Integration Test');
    console.log('='.repeat(50));
    
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n✅ Your Pinata integration is configured correctly!');
      console.log('You can now use this module to upload NFT images and metadata.');
    } else {
      console.error('\n❌ Failed to connect to Pinata.');
      console.log('Please check your API credentials in the .env file.');
    }
    
    console.log('\nTo use this module in your code:');
    console.log(`const pinata = require('./pinata-real.js');`);
    console.log(`await pinata.uploadFile('path/to/image.png', 'My NFT Image');`);
  })();
}
