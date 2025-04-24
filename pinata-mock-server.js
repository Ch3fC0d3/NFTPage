const express = require('express');
const path = require('path');
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Initialize Pinata client if API keys are available
let pinata = null;
try {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_API_SECRET;
  
  if (pinataApiKey && pinataSecretApiKey) {
    pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    console.log('Pinata client initialized successfully');
  } else {
    console.log('Pinata API keys not found in environment variables');
    console.log('Create a .env file with PINATA_API_KEY and PINATA_API_SECRET to enable IPFS pinning');
  }
} catch (error) {
  console.error('Error initializing Pinata client:', error);
}

// Mock data for NFTs
const mockNFTs = {
  owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  mintPrice: '10000000000000000', // 0.01 ETH in wei
  balances: {},
  ownership: {},
  tokens: {},
  nextTokenId: 1,
  ipfsHashes: {} // Store IPFS hashes for metadata and images
};

// Initialize with some example NFTs
function initializeMockData() {
  // Create example NFTs
  for (let i = 1; i <= 3; i++) {
    mockNFTs.tokens[i] = {
      name: `NFT #${i}`,
      description: `This is a mock NFT with ID ${i}`,
      image: `/public/nfts/images/${i}.png`,
      attributes: [
        { trait_type: 'Token ID', value: i.toString() },
        { trait_type: 'Collection', value: 'MockNFT' },
        { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare'][Math.floor(Math.random() * 3)] }
      ]
    };
  }
}

// Initialize mock data
initializeMockData();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// === MOCK API ENDPOINTS ===

// Get contract owner
app.get('/api/mock/owner', (req, res) => {
  console.log('GET /api/mock/owner');
  res.json({ owner: mockNFTs.owner });
});

// Get mint price
app.get('/api/mock/mintPrice', (req, res) => {
  console.log('GET /api/mock/mintPrice');
  res.json({ mintPrice: mockNFTs.mintPrice });
});

// Pin content to IPFS using Pinata
async function pinToIPFS(content, name) {
  if (!pinata) {
    console.log('Pinata client not initialized, skipping IPFS pinning');
    return null;
  }
  
  try {
    const options = {
      pinataMetadata: {
        name: name
      }
    };
    
    const result = await pinata.pinJSONToIPFS(content, options);
    console.log(`Pinned to IPFS with hash: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    return null;
  }
}

// Mint a new NFT
app.post('/api/mock/mint', async (req, res) => {
  console.log('POST /api/mock/mint', req.body);
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ success: false, error: 'Address is required' });
  }
  
  // Mint a new NFT
  const tokenId = mockNFTs.nextTokenId++;
  
  // Create token metadata
  const metadata = {
    name: `NFT #${tokenId}`,
    description: `This is a mock NFT with ID ${tokenId}`,
    image: `/public/nfts/images/${tokenId % 3 + 1}.png`, // Reuse existing images
    attributes: [
      { trait_type: 'Token ID', value: tokenId.toString() },
      { trait_type: 'Collection', value: 'MockNFT' },
      { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare'][Math.floor(Math.random() * 3)] }
    ]
  };
  
  // Try to pin metadata to IPFS
  let ipfsHash = null;
  if (pinata) {
    ipfsHash = await pinToIPFS(metadata, `NFT #${tokenId} Metadata`);
    if (ipfsHash) {
      mockNFTs.ipfsHashes[tokenId] = ipfsHash;
      // Update the metadata with IPFS image URL if pinning was successful
      metadata.image = `ipfs://${ipfsHash}`;
    }
  }
  
  // Store the metadata
  mockNFTs.tokens[tokenId] = metadata;
  
  // Update ownership
  if (!mockNFTs.ownership[address]) {
    mockNFTs.ownership[address] = [];
  }
  mockNFTs.ownership[address].push(tokenId);
  
  // Update balance
  mockNFTs.balances[address] = (mockNFTs.balances[address] || 0) + 1;
  
  console.log(`Minted NFT #${tokenId} for ${address}`);
  if (ipfsHash) {
    console.log(`Metadata pinned to IPFS: ipfs://${ipfsHash}`);
  }
  
  res.json({ 
    success: true, 
    tokenId,
    ipfsHash: ipfsHash,
    ipfsUrl: ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : null
  });
});

// Get balance of address
app.get('/api/mock/balanceOf/:address', (req, res) => {
  const { address } = req.params;
  console.log(`GET /api/mock/balanceOf/${address}`);
  
  const balance = mockNFTs.balances[address] || 0;
  res.json({ balance });
});

// Get token of owner by index
app.get('/api/mock/tokenOfOwnerByIndex/:address/:index', (req, res) => {
  const { address, index } = req.params;
  console.log(`GET /api/mock/tokenOfOwnerByIndex/${address}/${index}`);
  
  const tokens = mockNFTs.ownership[address] || [];
  const tokenId = tokens[parseInt(index)] || null;
  
  if (tokenId === null) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  res.json({ tokenId });
});

// Get token URI
app.get('/api/mock/tokenURI/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  console.log(`GET /api/mock/tokenURI/${tokenId}`);
  
  const token = mockNFTs.tokens[tokenId];
  
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  // If we have an IPFS hash for this token, return the IPFS URI
  const ipfsHash = mockNFTs.ipfsHashes[tokenId];
  if (ipfsHash) {
    res.json({ tokenURI: `ipfs://${ipfsHash}` });
  } else {
    // Otherwise return the token metadata as a JSON string
    res.json({ tokenURI: JSON.stringify(token) });
  }
});

// Get NFT metadata directly
app.get('/api/nft/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  console.log(`GET /api/nft/${tokenId}`);
  
  const token = mockNFTs.tokens[tokenId];
  
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  res.json(token);
});

// Pin existing NFT to IPFS
app.post('/api/mock/pin/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  console.log(`POST /api/mock/pin/${tokenId}`);
  
  const token = mockNFTs.tokens[tokenId];
  
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  if (!pinata) {
    return res.status(503).json({ 
      success: false, 
      error: 'Pinata client not initialized. Check your API keys.' 
    });
  }
  
  try {
    // Pin the metadata to IPFS
    const ipfsHash = await pinToIPFS(token, `NFT #${tokenId} Metadata`);
    
    if (!ipfsHash) {
      return res.status(500).json({ success: false, error: 'Failed to pin to IPFS' });
    }
    
    // Store the IPFS hash
    mockNFTs.ipfsHashes[tokenId] = ipfsHash;
    
    // Update the token's image URL to use IPFS
    token.image = `ipfs://${ipfsHash}`;
    
    res.json({ 
      success: true, 
      tokenId,
      ipfsHash: ipfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Pinata API status
app.get('/api/mock/pinata/status', async (req, res) => {
  if (!pinata) {
    return res.json({ 
      initialized: false, 
      message: 'Pinata client not initialized. Check your API keys in .env file.' 
    });
  }
  
  try {
    // Test the Pinata connection
    const testAuth = await pinata.testAuthentication();
    res.json({ 
      initialized: true, 
      authenticated: true,
      message: 'Pinata client initialized and authenticated successfully',
      details: testAuth
    });
  } catch (error) {
    console.error('Error testing Pinata authentication:', error);
    res.json({ 
      initialized: true, 
      authenticated: false,
      message: 'Pinata client initialized but authentication failed',
      error: error.message
    });
  }
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'nft.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock NFT server with Pinata IPFS support running at http://localhost:${PORT}`);
  console.log('Available mock API endpoints:');
  console.log('- GET  /api/mock/owner');
  console.log('- GET  /api/mock/mintPrice');
  console.log('- POST /api/mock/mint');
  console.log('- GET  /api/mock/balanceOf/:address');
  console.log('- GET  /api/mock/tokenOfOwnerByIndex/:address/:index');
  console.log('- GET  /api/mock/tokenURI/:tokenId');
  console.log('- GET  /api/nft/:tokenId');
  console.log('- POST /api/mock/pin/:tokenId');
  console.log('- GET  /api/mock/pinata/status');
  
  if (!pinata) {
    console.log('\nPinata integration is DISABLED.');
    console.log('To enable Pinata IPFS pinning, create a .env file with:');
    console.log('PINATA_API_KEY=your_api_key');
    console.log('PINATA_API_SECRET=your_api_secret');
  } else {
    console.log('\nPinata integration is ENABLED.');
    console.log('NFTs will be pinned to IPFS when minted.');
  }
});
