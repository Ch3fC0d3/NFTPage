// Pinata IPFS pinning utility
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Pinata client with API keys from .env
let pinata = null;
if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
    try {
        // The correct way to initialize the Pinata SDK
        pinata = new pinataSDK({ pinataApiKey: process.env.PINATA_API_KEY, pinataSecretApiKey: process.env.PINATA_API_SECRET });
        console.log('Pinata SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing Pinata SDK:', error.message);
    }
}

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
        // Check if file exists before attempting to pin
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return null;
        }

        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
            pinataMetadata: {
                name: name || path.basename(filePath)
            }
        };

        // Set a timeout for the Pinata API call
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Pinata API call timed out')), 15000);
        });

        // Race between the Pinata API call and the timeout
        const result = await Promise.race([
            pinata.pinFileToIPFS(readableStreamForFile, options),
            timeoutPromise
        ]);

        console.log(`Successfully pinned file to IPFS with hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error pinning file to IPFS:', error.message || error);
        // Return null instead of throwing to prevent application crash
        return null;
    }
}

/**
 * Pins JSON metadata to IPFS via Pinata
 * @param {Object} json - JSON metadata to pin
 * @param {string} name - Name for the metadata in Pinata
 * @returns {Promise<string>} - IPFS hash (CID) of the pinned metadata
 */
async function pinJSONToIPFS(json, name) {
    if (!pinata) {
        console.warn('Pinata API keys not found in .env, skipping IPFS pinning');
        return null;
    }

    try {
        // Validate JSON before pinning
        if (!json || typeof json !== 'object') {
            console.error('Invalid JSON object provided for pinning');
            return null;
        }

        const options = {
            pinataMetadata: {
                name: name || 'NFT Metadata'
            }
        };

        // Set a timeout for the Pinata API call
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Pinata JSON API call timed out')), 15000);
        });

        // Race between the Pinata API call and the timeout
        const result = await Promise.race([
            pinata.pinJSONToIPFS(json, options),
            timeoutPromise
        ]);

        console.log(`Successfully pinned JSON to IPFS with hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error pinning JSON to IPFS:', error.message || error);
        // Return null instead of throwing to prevent application crash
        return null;
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
