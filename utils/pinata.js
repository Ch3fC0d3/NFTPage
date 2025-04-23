// Pinata IPFS pinning utility
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Pinata client with API keys from .env
const pinata = process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET
    ? pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)
    : null;

/**
 * Pins a file to IPFS via Pinata
 * @param {string} filePath - Path to the file to pin
 * @param {string} name - Name for the file in Pinata
 * @returns {Promise<string>} - IPFS hash (CID) of the pinned file
 */
async function pinFileToIPFS(filePath, name) {
    if (!pinata) {
        console.warn('Pinata API keys not found in .env, skipping IPFS pinning');
        return null;
    }

    try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
            pinataMetadata: {
                name: name || path.basename(filePath)
            }
        };

        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log(`Successfully pinned file to IPFS with hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error pinning file to IPFS:', error);
        throw error;
    }
}

/**
 * Pins JSON metadata to IPFS via Pinata
 * @param {Object} metadata - JSON metadata to pin
 * @param {string} name - Name for the metadata in Pinata
 * @returns {Promise<string>} - IPFS hash (CID) of the pinned metadata
 */
async function pinJSONToIPFS(metadata, name) {
    if (!pinata) {
        console.warn('Pinata API keys not found in .env, skipping IPFS pinning');
        return null;
    }

    try {
        const options = {
            pinataMetadata: {
                name: name || 'NFT Metadata'
            }
        };

        const result = await pinata.pinJSONToIPFS(metadata, options);
        console.log(`Successfully pinned JSON to IPFS with hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error pinning JSON to IPFS:', error);
        throw error;
    }
}

/**
 * Gets the IPFS gateway URL for a given hash
 * @param {string} ipfsHash - IPFS hash (CID)
 * @param {string} gateway - IPFS gateway URL (defaults to Pinata gateway)
 * @returns {string} - Full URL to access the content
 */
function getIPFSGatewayURL(ipfsHash, gateway = 'https://gateway.pinata.cloud') {
    if (!ipfsHash) return null;
    return `${gateway}/ipfs/${ipfsHash}`;
}

module.exports = {
    pinFileToIPFS,
    pinJSONToIPFS,
    getIPFSGatewayURL
};
