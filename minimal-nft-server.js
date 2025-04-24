const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = 3000; // Using port 3000 to avoid conflicts

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

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

// Test route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
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
