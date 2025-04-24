const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = 8888; // Using port 8888 to avoid conflicts

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable trailing slashes to prevent redirect issues
app.set('strict routing', true);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname), {
  extensions: ['html'] // This will serve .html files without requiring the extension
}));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const publicDir = path.join(__dirname, 'public');
const nftsDir = path.join(publicDir, 'nfts');
const imagesDir = path.join(nftsDir, 'images');

[publicDir, nftsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Root route - serve the nft.html file
app.get('/', (req, res) => {
  console.log('Serving nft.html file...');
  res.sendFile(path.join(__dirname, 'nft.html'));
});

// Test route (both with and without trailing slash)
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.get('/test/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mock NFT API endpoints to simulate contract functions
const mockNFTs = {};
let mockMintPrice = "10000000000000000"; // 0.01 ETH in wei

// Mock owner endpoint
app.get('/api/mock/owner', (req, res) => {
  res.json({ owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" });
});

// Mock getMintPrice endpoint
app.get('/api/mock/mintPrice', (req, res) => {
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
      image: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`
    }
  };
  
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
  
  res.json({ tokenId: ownedTokens[parseInt(index)].tokenId });
});

// Mock tokenURI endpoint
app.get('/api/mock/tokenURI/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  
  if (!mockNFTs[tokenId]) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  res.json({ tokenURI: JSON.stringify(mockNFTs[tokenId].metadata) });
});

// NFT metadata endpoint
app.get('/api/nft/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  
  if (isNaN(tokenId) || tokenId <= 0) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }
  
  // Create a simple metadata object
  const metadata = {
    name: `Test NFT #${tokenId}`,
    description: `This is a test NFT with ID ${tokenId}`,
    image: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`,
    attributes: [
      {
        trait_type: 'Token ID',
        value: tokenId
      }
    ]
  };
  
  res.json(metadata);
});

// Error handling middleware
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).send('404 - Page Not Found');
});

app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).send('500 - Server Error');
});

// Start the server with better error handling
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`NFT Server started successfully on port ${PORT}!`);
  console.log('='.repeat(50));
  console.log(`Main website: http://localhost:${PORT}`);
  console.log(`Test page: http://localhost:${PORT}/test`);
  console.log(`API test: http://localhost:${PORT}/api/test`);
  console.log(`NFT metadata example: http://localhost:${PORT}/api/nft/1`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
