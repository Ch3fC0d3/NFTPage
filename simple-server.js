const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Enable JSON parsing
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Create directories
const publicDir = path.join(__dirname, 'public');
const nftsDir = path.join(publicDir, 'nfts');
const imagesDir = path.join(nftsDir, 'images');

// Create directories if they don't exist
[publicDir, nftsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Simple test endpoint
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
    image: `http://localhost:8000/public/nfts/images/${tokenId}.png`,
    attributes: [
      {
        trait_type: 'Token ID',
        value: tokenId
      }
    ]
  };
  
  res.json(metadata);
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Simple test server running at http://localhost:${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
  console.log(`Test NFT metadata at: http://localhost:${PORT}/api/nft/1`);
});
