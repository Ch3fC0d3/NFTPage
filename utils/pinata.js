// Pinata IPFS pinning utilities
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Pinata client with API keys from .env
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET
});

/**
 * Upload a file to IPFS via Pinata
 * @param {string} filePath - Path to the file to upload
 * @param {string} name - Name for the file (used in Pinata UI)
 * @returns {Promise<string>} - IPFS URI (ipfs://CID)
 */
async function uploadFileToPinata(filePath, name) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    
    console.log(`Reading file from: ${filePath}`);
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name
      }
    };
    
    console.log('Uploading file to Pinata...');
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    console.log(`File uploaded to IPFS with hash: ${result.IpfsHash}`);
    
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - The metadata object to upload
 * @param {string} name - Name for the metadata (used in Pinata UI)
 * @returns {Promise<string>} - IPFS URI (ipfs://CID)
 */
async function uploadMetadataToPinata(metadata, name) {
  try {
    const options = {
      pinataMetadata: {
        name
      }
    };
    
    const result = await pinata.pinJSONToIPFS(metadata, options);
    console.log(`Metadata uploaded to IPFS with hash: ${result.IpfsHash}`);
    
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw error;
  }
}

/**
 * Test Pinata connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
async function testPinataConnection() {
  try {
    const result = await pinata.testAuthentication();
    console.log('Pinata connection successful:', result);
    return true;
  } catch (error) {
    console.error('Pinata connection failed:', error);
    return false;
  }
}

module.exports = {
  uploadFileToPinata,
  uploadMetadataToPinata,
  testPinataConnection
};
