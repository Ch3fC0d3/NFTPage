const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Mock data for NFTs
const mockNFTs = {
  owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  mintPrice: '10000000000000000', // 0.01 ETH in wei
  balances: {},
  ownership: {},
  tokens: {},
  nextTokenId: 1
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

// Mint a new NFT
app.post('/api/mock/mint', (req, res) => {
  console.log('POST /api/mock/mint', req.body);
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ success: false, error: 'Address is required' });
  }
  
  // Mint a new NFT
  const tokenId = mockNFTs.nextTokenId++;
  
  // Create token metadata
  mockNFTs.tokens[tokenId] = {
    name: `NFT #${tokenId}`,
    description: `This is a mock NFT with ID ${tokenId}`,
    image: `/public/nfts/images/${tokenId % 3 + 1}.png`, // Reuse existing images
    attributes: [
      { trait_type: 'Token ID', value: tokenId.toString() },
      { trait_type: 'Collection', value: 'MockNFT' },
      { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare'][Math.floor(Math.random() * 3)] }
    ]
  };
  
  // Update ownership
  if (!mockNFTs.ownership[address]) {
    mockNFTs.ownership[address] = [];
  }
  mockNFTs.ownership[address].push(tokenId);
  
  // Update balance
  mockNFTs.balances[address] = (mockNFTs.balances[address] || 0) + 1;
  
  console.log(`Minted NFT #${tokenId} for ${address}`);
  
  res.json({ success: true, tokenId });
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
  
  // Return the token metadata as a JSON string
  res.json({ tokenURI: JSON.stringify(token) });
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

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'nft.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock NFT server running at http://localhost:${PORT}`);
  console.log('Available mock API endpoints:');
  console.log('- GET  /api/mock/owner');
  console.log('- GET  /api/mock/mintPrice');
  console.log('- POST /api/mock/mint');
  console.log('- GET  /api/mock/balanceOf/:address');
  console.log('- GET  /api/mock/tokenOfOwnerByIndex/:address/:index');
  console.log('- GET  /api/mock/tokenURI/:tokenId');
  console.log('- GET  /api/nft/:tokenId');
});
