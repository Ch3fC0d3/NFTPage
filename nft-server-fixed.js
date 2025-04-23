/**
 * NFT Server with Deterministic Art Generation
 * 
 * This server provides API endpoints for NFT metadata and generates
 * deterministic artwork based on token IDs.
 */

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

// Define directory paths
const publicDir = path.join(__dirname, 'public');
const nftsDir = path.join(publicDir, 'nfts');
const imagesDir = path.join(nftsDir, 'images');

/**
 * Ensure all required directories exist
 */
function ensureDirectoriesExist() {
  [publicDir, nftsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Initialize directories
ensureDirectoriesExist();

/**
 * Generate deterministic random number based on token ID
 * @param {number} tokenId - The NFT token ID
 * @param {number} max - Maximum value
 * @param {number} offset - Optional offset to get different values from same token ID
 * @returns {number} - Random number between 0 and max
 */
function getRandomForToken(tokenId, max, offset = 0) {
  const seed = parseInt(tokenId) + offset;
  const x = Math.sin(seed * 9999) * 10000;
  return (x - Math.floor(x)) * max;
}

/**
 * Generate deterministic artwork based on token ID
 * @param {number} tokenId - The NFT token ID
 * @param {string} outputPath - Path to save the generated image
 * @returns {string} - The path to the generated image
 */
function generateNFTArt(tokenId, outputPath) {
  console.log(`Generating art for token ID ${tokenId}`);
  
  try {
    // Create canvas
    const width = 500;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background pattern based on token ID
    const patternType = Math.floor(getRandomForToken(tokenId, 4));
    
    switch (patternType) {
      case 0: // Solid color
        const bgHue = Math.floor(getRandomForToken(tokenId, 360));
        ctx.fillStyle = `hsl(${bgHue}, 70%, 80%)`;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case 1: // Gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `hsl(${Math.floor(getRandomForToken(tokenId, 360))}, 70%, 80%)`);
        gradient.addColorStop(1, `hsl(${Math.floor(getRandomForToken(tokenId, 360, 100))}, 70%, 80%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case 2: // Grid
        const gridSize = 20 + Math.floor(getRandomForToken(tokenId, 30));
        const baseHue = Math.floor(getRandomForToken(tokenId, 360));
        
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            const hueShift = ((x + y) / (width + height)) * 60;
            ctx.fillStyle = `hsl(${(baseHue + hueShift) % 360}, 70%, ${70 + getRandomForToken(tokenId, 20, x+y)}%)`;
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
        break;
        
      case 3: // Circles
        ctx.fillStyle = `hsl(${Math.floor(getRandomForToken(tokenId, 360))}, 70%, 80%)`;
        ctx.fillRect(0, 0, width, height);
        
        const circleCount = 10 + Math.floor(getRandomForToken(tokenId, 20));
        for (let i = 0; i < circleCount; i++) {
          ctx.fillStyle = `hsla(${Math.floor(getRandomForToken(tokenId, 360, i))}, 70%, 70%, 0.2)`;
          const circleSize = 50 + getRandomForToken(tokenId, 150, i);
          ctx.beginPath();
          ctx.arc(
            getRandomForToken(tokenId, width, i*10), 
            getRandomForToken(tokenId, height, i*20), 
            circleSize, 0, Math.PI * 2
          );
          ctx.fill();
        }
        break;
    }
    
    // Draw shapes
    const numShapes = 5 + Math.floor(getRandomForToken(tokenId, 15));
    
    for (let i = 0; i < numShapes; i++) {
      // Shape style
      const hue = Math.floor(getRandomForToken(tokenId, 360, i * 100));
      const saturation = 70 + Math.floor(getRandomForToken(tokenId, 30, i));
      const lightness = 40 + Math.floor(getRandomForToken(tokenId, 40, i));
      const alpha = 0.3 + getRandomForToken(tokenId, 0.7, i);
      
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.strokeStyle = `hsla(${(hue + 180) % 360}, ${saturation}%, ${lightness - 20}%, ${alpha + 0.2})`;
      ctx.lineWidth = 1 + getRandomForToken(tokenId, 5, i);
      
      // Position and size
      const x = width * 0.1 + getRandomForToken(tokenId, width * 0.8, i * 10);
      const y = height * 0.1 + getRandomForToken(tokenId, height * 0.8, i * 20);
      const size = 20 + getRandomForToken(tokenId, 100, i * 30);
      
      // Choose shape type
      const shapeType = Math.floor(getRandomForToken(tokenId, 6, i));
      
      // Draw shape
      switch (shapeType) {
        case 0: // Circle
          ctx.beginPath();
          ctx.arc(x, y, size/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
          
        case 1: // Rectangle
          ctx.fillRect(x - size/2, y - size/2, size, size);
          ctx.strokeRect(x - size/2, y - size/2, size, size);
          break;
          
        case 2: // Triangle
          ctx.beginPath();
          ctx.moveTo(x, y - size/2);
          ctx.lineTo(x + size/2, y + size/2);
          ctx.lineTo(x - size/2, y + size/2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case 3: // Star
          const spikes = 5 + Math.floor(getRandomForToken(tokenId, 5, i));
          const outerRadius = size/2;
          const innerRadius = size/4;
          
          ctx.beginPath();
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * j / spikes;
            ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case 4: // Hexagon
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI / 3) * j;
            ctx.lineTo(x + Math.cos(angle) * size/2, y + Math.sin(angle) * size/2);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case 5: // Custom shape
          const points = 3 + Math.floor(getRandomForToken(tokenId, 6, i + 50));
          const radiusVariance = 0.2 + getRandomForToken(tokenId, 0.6, i);
          
          ctx.beginPath();
          for (let j = 0; j < points; j++) {
            const angle = (Math.PI * 2 / points) * j;
            const pointRadius = size/2 * (1 - radiusVariance + getRandomForToken(tokenId, radiusVariance * 2, j));
            ctx.lineTo(x + Math.cos(angle) * pointRadius, y + Math.sin(angle) * pointRadius);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
    }
    
    // Add token ID text
    const textBgSize = 120;
    const textBgHeight = 40;
    const textBgY = height - textBgHeight - 10;
    
    // Text background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(width/2 - textBgSize/2, textBgY, textBgSize, textBgHeight, 10);
    ctx.fill();
    
    // Token ID text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`NFT #${tokenId}`, width/2, textBgY + textBgHeight/2);
    
    // Save image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Art generated successfully for token ID ${tokenId}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating NFT art for token ID ${tokenId}:`, error);
    throw error;
  }
}

/**
 * API endpoint for NFT metadata
 */
app.get('/api/nft/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  console.log(`API request for NFT metadata: tokenId=${tokenId}`);
  
  try {
    // Validate token ID
    const id = parseInt(tokenId);
    if (isNaN(id) || id <= 0) {
      console.error(`Invalid token ID: ${tokenId}`);
      return res.status(400).json({ error: 'Invalid token ID' });
    }
    
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Define paths
    const imagePath = path.join(imagesDir, `${id}.png`);
    const imageUrl = `http://localhost:${PORT}/public/nfts/images/${id}.png`;
    
    // Generate image if it doesn't exist
    if (!fs.existsSync(imagePath)) {
      console.log(`Generating NFT art for token ID: ${id}`);
      generateNFTArt(id, imagePath);
    }
    
    // Verify image was created
    if (!fs.existsSync(imagePath)) {
      console.error(`Failed to generate NFT art: ${imagePath}`);
      return res.status(500).json({ error: 'Failed to generate NFT art' });
    }
    
    // Generate metadata attributes
    const rarityLevel = Math.floor(getRandomForToken(id, 100));
    let rarity;
    
    if (rarityLevel < 50) rarity = 'Common';
    else if (rarityLevel < 80) rarity = 'Uncommon';
    else if (rarityLevel < 95) rarity = 'Rare';
    else rarity = 'Legendary';
    
    // Create metadata
    const metadata = {
      name: `Geometric NFT #${id}`,
      description: `A unique algorithmically generated NFT with ID ${id}`,
      image: imageUrl,
      external_url: `http://localhost:${PORT}/nft.html?id=${id}`,
      attributes: [
        {
          trait_type: 'Token ID',
          value: id
        },
        {
          trait_type: 'Series',
          value: 'Geometric'
        },
        {
          trait_type: 'Generation',
          value: 'Algorithmic'
        },
        {
          trait_type: 'Complexity',
          value: (id % 10) + 1
        },
        {
          trait_type: 'Rarity',
          value: rarity
        },
        {
          trait_type: 'Pattern Type',
          value: ['Solid', 'Gradient', 'Grid', 'Circles'][Math.floor(getRandomForToken(id, 4))]
        },
        {
          trait_type: 'Shape Count',
          value: 5 + Math.floor(getRandomForToken(id, 15))
        },
        {
          display_type: 'boost_percentage',
          trait_type: 'Artistic Value',
          value: Math.floor(getRandomForToken(id, 100))
        }
      ]
    };
    
    console.log(`Returning metadata for token ID: ${id}`);
    res.json(metadata);
  } catch (error) {
    console.error(`Error generating NFT metadata for token ID ${tokenId}:`, error);
    res.status(500).json({ 
      error: 'Failed to generate NFT metadata', 
      message: error.message
    });
  }
});

/**
 * Debug endpoint to check if an image exists
 */
app.get('/debug/image/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  
  if (isNaN(tokenId) || tokenId <= 0) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }
  
  const imagePath = path.join(imagesDir, `${tokenId}.png`);
  
  res.json({
    tokenId,
    imageDir: imagesDir,
    imagePath,
    imageExists: fs.existsSync(imagePath),
    imageUrl: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`
  });
});

/**
 * Endpoint to force generate an image
 */
app.get('/generate-image/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  
  try {
    const id = parseInt(tokenId);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid token ID' });
    }
    
    ensureDirectoriesExist();
    const imagePath = path.join(imagesDir, `${id}.png`);
    
    generateNFTArt(id, imagePath);
    
    res.json({
      success: true,
      tokenId: id,
      imagePath,
      imageUrl: `http://localhost:${PORT}/public/nfts/images/${id}.png`
    });
  } catch (error) {
    console.error(`Error generating image for token ID ${tokenId}:`, error);
    res.status(500).json({ 
      error: 'Failed to generate image', 
      message: error.message
    });
  }
});

/**
 * Endpoint to list all generated NFTs
 */
app.get('/api/nfts', (req, res) => {
  try {
    if (!fs.existsSync(imagesDir)) {
      return res.json({ nfts: [] });
    }
    
    const files = fs.readdirSync(imagesDir);
    
    const nfts = files
      .filter(file => file.endsWith('.png'))
      .map(file => {
        const tokenId = parseInt(file.replace('.png', ''));
        return {
          tokenId,
          imageUrl: `http://localhost:${PORT}/public/nfts/images/${tokenId}.png`,
          metadataUrl: `http://localhost:${PORT}/api/nft/${tokenId}`
        };
      });
    
    res.json({ nfts });
  } catch (error) {
    console.error('Error listing NFTs:', error);
    res.status(500).json({ error: 'Failed to list NFTs', message: error.message });
  }
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`NFT Server started successfully on port ${PORT}!`);
  console.log('='.repeat(50));
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`NFT metadata API: http://localhost:${PORT}/api/nft/{tokenId}`);
  console.log(`Debug endpoint: http://localhost:${PORT}/debug/image/{tokenId}`);
  console.log(`Generate image: http://localhost:${PORT}/generate-image/{tokenId}`);
  console.log(`List all NFTs: http://localhost:${PORT}/api/nfts`);
  console.log('='.repeat(50));
  console.log(`IMPORTANT: Set your contract's baseURI to: http://localhost:${PORT}/api/nft/`);
  console.log('='.repeat(50));
});
