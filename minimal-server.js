const express = require('express');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create Express app
const app = express();
const PORT = 8000;

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Directory setup
const publicDir = path.join(__dirname, 'public');
const nftsDir = path.join(publicDir, 'nfts');
const imagesDir = path.join(nftsDir, 'images');

// Create directories if they don't exist
[publicDir, nftsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory exists: ${dir}`);
  }
});

// Simple random function based on token ID
function getRandomForToken(tokenId, max, offset = 0) {
  const seed = parseInt(tokenId) + offset;
  const x = Math.sin(seed * 9999) * 10000;
  return (x - Math.floor(x)) * max;
}

// Generate NFT art
function generateNFTArt(tokenId, outputPath) {
  console.log(`Generating art for token ID ${tokenId}`);
  
  // Create canvas
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  const bgHue = Math.floor(getRandomForToken(tokenId, 360));
  ctx.fillStyle = `hsl(${bgHue}, 70%, 80%)`;
  ctx.fillRect(0, 0, width, height);
  
  // Draw shapes
  const numShapes = 5 + Math.floor(getRandomForToken(tokenId, 10));
  
  for (let i = 0; i < numShapes; i++) {
    // Shape style
    ctx.fillStyle = `hsla(${Math.floor(getRandomForToken(tokenId, 360, i*100))}, 100%, 50%, 0.7)`;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    
    // Position and size
    const x = getRandomForToken(tokenId, width, i*10);
    const y = getRandomForToken(tokenId, height, i*20);
    const size = 20 + getRandomForToken(tokenId, 100, i*30);
    
    // Draw shape (alternate between circle and rectangle)
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.arc(x, y, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x-size/2, y-size/2, size, size);
      ctx.strokeRect(x-size/2, y-size/2, size, size);
    }
  }
  
  // Add token ID text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`NFT #${tokenId}`, width/2, height - 20);
  
  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Art generated for token ID ${tokenId} at ${outputPath}`);
  return outputPath;
}

// API endpoint for NFT metadata
app.get('/api/nft/:tokenId', (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId) || tokenId <= 0) {
      return res.status(400).json({ error: 'Invalid token ID' });
    }
    
    // Generate image if it doesn't exist
    const imagePath = path.join(imagesDir, `${tokenId}.png`);
    if (!fs.existsSync(imagePath)) {
      generateNFTArt(tokenId, imagePath);
    }
    
    // Create metadata
    const metadata = {
      name: `Geometric NFT #${tokenId}`,
      description: `A unique algorithmically generated NFT with ID ${tokenId}`,
      image: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`,
      attributes: [
        {
          trait_type: 'Token ID',
          value: tokenId
        },
        {
          trait_type: 'Series',
          value: 'Geometric'
        },
        {
          trait_type: 'Rarity',
          value: tokenId % 4 === 0 ? 'Rare' : 'Common'
        }
      ]
    };
    
    res.json(metadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug endpoint
app.get('/debug/image/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  const imagePath = path.join(imagesDir, `${tokenId}.png`);
  
  res.json({
    tokenId,
    imagePath,
    exists: fs.existsSync(imagePath),
    url: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`
  });
});

// Force generate image
app.get('/generate-image/:tokenId', (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    const imagePath = path.join(imagesDir, `${tokenId}.png`);
    
    generateNFTArt(tokenId, imagePath);
    
    res.json({
      success: true,
      tokenId,
      imagePath,
      url: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`NFT Server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/nft/{tokenId}`);
  console.log(`Debug endpoint: http://localhost:${PORT}/debug/image/{tokenId}`);
  console.log(`Generate image: http://localhost:${PORT}/generate-image/{tokenId}`);
});
