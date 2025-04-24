const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = 4000;

// Enable CORS for all routes
app.use(cors());

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock NFT data
const mockNFTs = {};
let mockMintPrice = "10000000000000000"; // 0.01 ETH in wei
const mockOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Mock owner endpoint
app.get('/api/mock/owner', (req, res) => {
  console.log('Mock API: Returning owner address');
  res.json({ owner: mockOwner });
});

// Mock getMintPrice endpoint
app.get('/api/mock/mintPrice', (req, res) => {
  console.log('Mock API: Returning mint price');
  res.json({ mintPrice: mockMintPrice });
});

// Mock mint endpoint
app.post('/api/mock/mint', (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  const tokenId = Object.keys(mockNFTs).length + 1;
  mockNFTs[tokenId] = {
    owner: address,
    tokenId: tokenId,
    metadata: {
      name: `NFT #${tokenId}`,
      description: `This is a mock NFT with ID ${tokenId}`,
      image: `http://localhost:8888/public/nfts/images/${tokenId}.png`
    }
  };
  
  console.log(`Mock API: Minted NFT #${tokenId} to ${address}`);
  res.json({ success: true, tokenId });
});

// Mock balanceOf endpoint
app.get('/api/mock/balanceOf/:address', (req, res) => {
  const { address } = req.params;
  let balance = 0;
  
  Object.values(mockNFTs).forEach(nft => {
    if (nft.owner.toLowerCase() === address.toLowerCase()) {
      balance++;
    }
  });
  
  console.log(`Mock API: Balance of ${address} is ${balance}`);
  res.json({ balance });
});

// Mock tokenOfOwnerByIndex endpoint
app.get('/api/mock/tokenOfOwnerByIndex/:address/:index', (req, res) => {
  const { address, index } = req.params;
  const ownedTokens = Object.values(mockNFTs).filter(nft => 
    nft.owner.toLowerCase() === address.toLowerCase()
  );
  
  if (parseInt(index) >= ownedTokens.length) {
    return res.status(400).json({ error: 'Index out of bounds' });
  }
  
  const tokenId = ownedTokens[parseInt(index)].tokenId;
  console.log(`Mock API: Token at index ${index} for ${address} is ${tokenId}`);
  res.json({ tokenId });
});

// Mock tokenURI endpoint
app.get('/api/mock/tokenURI/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  
  if (!mockNFTs[tokenId]) {
    // Create a default metadata for tokens that don't exist yet
    const defaultMetadata = {
      name: `NFT #${tokenId}`,
      description: `This is NFT #${tokenId}`,
      image: `http://localhost:8888/public/nfts/images/${tokenId}.png`,
      attributes: [
        {
          trait_type: 'Token ID',
          value: parseInt(tokenId)
        }
      ]
    };
    
    console.log(`Mock API: Returning default metadata for token ${tokenId}`);
    return res.json({ tokenURI: JSON.stringify(defaultMetadata) });
  }
  
  console.log(`Mock API: Returning metadata for token ${tokenId}`);
  res.json({ tokenURI: JSON.stringify(mockNFTs[tokenId].metadata) });
});

// Add a few sample NFTs
for (let i = 1; i <= 3; i++) {
  mockNFTs[i] = {
    owner: mockOwner,
    tokenId: i,
    metadata: {
      name: `Sample NFT #${i}`,
      description: `This is a sample NFT with ID ${i}`,
      image: `http://localhost:8888/public/nfts/images/${i}.png`,
      attributes: [
        {
          trait_type: 'Token ID',
          value: i
        },
        {
          trait_type: 'Rarity',
          value: i === 1 ? 'Common' : i === 2 ? 'Uncommon' : 'Rare'
        }
      ]
    }
  };
}

// Error handling middleware
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Mock API Server started successfully on port ${PORT}!`);
  console.log('='.repeat(50));
  console.log(`Mock API endpoints:`);
  console.log(`- GET  /api/mock/owner`);
  console.log(`- GET  /api/mock/mintPrice`);
  console.log(`- POST /api/mock/mint`);
  console.log(`- GET  /api/mock/balanceOf/:address`);
  console.log(`- GET  /api/mock/tokenOfOwnerByIndex/:address/:index`);
  console.log(`- GET  /api/mock/tokenURI/:tokenId`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
