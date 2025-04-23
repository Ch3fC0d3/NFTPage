const express = require('express');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create Express app
const app = express();

// Set the port back to 8000 to match the frontend's expectations
const PORT = 8000;

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Define directory paths
const publicDir = path.join(__dirname, 'public');
const metadataDir = path.join(publicDir, 'nfts');
const imageDir = path.join(metadataDir, 'images');

// Ensure all required directories exist
function ensureDirectoriesExist() {
  const dirs = [publicDir, metadataDir, imageDir];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Initialize directories
ensureDirectoriesExist();

/**
 * Generate deterministic artwork based on token ID
 * @param {number} tokenId - The NFT token ID
 * @param {string} outputPath - Path to save the generated image
 * @returns {string} - The path to the generated image
 */
function generateNFTArt(tokenId, outputPath) {
  try {
    // Create a canvas for our artwork
    const width = 500;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Use token ID for deterministic randomness
    const seed = parseInt(tokenId.toString());
    const rand = (max, offset = 0) => {
      // Enhanced deterministic random function based on seed
      const x = Math.sin((seed + offset) * 9999 + max) * 10000;
      return (x - Math.floor(x)) * max;
    };
    
    // Create a background pattern based on token ID
    const patternType = Math.floor(rand(4));
    
    switch (patternType) {
      case 0: // Solid color background
        const bgHue = Math.floor(rand(360));
        ctx.fillStyle = `hsl(${bgHue}, 70%, 80%)`;
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 1: // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `hsl(${Math.floor(rand(360))}, 70%, 80%)`);
        gradient.addColorStop(1, `hsl(${Math.floor(rand(360, 100))}, 70%, 80%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 2: // Grid pattern
        const gridSize = 20 + Math.floor(rand(30));
        const baseHue = Math.floor(rand(360));
        
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            const hueShift = ((x + y) / (width + height)) * 60;
            ctx.fillStyle = `hsl(${(baseHue + hueShift) % 360}, 70%, ${70 + rand(20)}%)`;
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
        break;
      
      case 3: // Circles pattern
        ctx.fillStyle = `hsl(${Math.floor(rand(360))}, 70%, 80%)`;
        ctx.fillRect(0, 0, width, height);
        
        const circleCount = 10 + Math.floor(rand(20));
        for (let i = 0; i < circleCount; i++) {
          ctx.fillStyle = `hsla(${Math.floor(rand(360, i))}, 70%, 70%, 0.2)`;
          const circleSize = 50 + rand(150);
          ctx.beginPath();
          ctx.arc(rand(width), rand(height), circleSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
    
    // Draw geometric shapes based on token ID
    const numShapes = 5 + Math.floor(rand(15));
    
    for (let i = 0; i < numShapes; i++) {
      // Pick shape style with more variety
      const hue = Math.floor(rand(360, i * 100));
      const saturation = 70 + Math.floor(rand(30));
      const lightness = 40 + Math.floor(rand(40));
      const alpha = 0.3 + rand(0.7);
      
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.strokeStyle = `hsla(${(hue + 180) % 360}, ${saturation}%, ${lightness - 20}%, ${alpha + 0.2})`;
      ctx.lineWidth = 1 + rand(5);
      
      // Random position with better distribution
      const x = width * 0.1 + rand(width * 0.8);
      const y = height * 0.1 + rand(height * 0.8);
      const size = 20 + rand(100);
      
      // Choose a shape based on token ID and iteration
      const shapeType = Math.floor(rand(6, i));
      
      // Draw different shapes based on the random value
      switch (shapeType) {
        case 0: // Circle
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 1: // Rectangle
          ctx.fillRect(x, y, size, size);
          ctx.strokeRect(x, y, size, size);
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
          const spikes = 5 + Math.floor(rand(5, i));
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
        case 5: // Custom shape based on token ID
          const points = 3 + Math.floor(rand(6, i + 50));
          const radiusVariance = 0.2 + rand(0.6);
          
          ctx.beginPath();
          for (let j = 0; j < points; j++) {
            const angle = (Math.PI * 2 / points) * j;
            const pointRadius = size/2 * (1 - radiusVariance + rand(radiusVariance * 2, j));
            ctx.lineTo(x + Math.cos(angle) * pointRadius, y + Math.sin(angle) * pointRadius);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
    }
    
    // Add token ID text with better styling
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
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return outputPath;
  } catch (error) {
    console.error(`Error generating NFT art for token ID ${tokenId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

// API endpoint to get NFT metadata
app.get('/api/nft/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  console.log(`API request for NFT metadata: tokenId=${tokenId}`);
  
  try {
    // Ensure token ID is a valid number
    const id = parseInt(tokenId);
    if (isNaN(id) || id <= 0) {
      console.error(`Invalid token ID: ${tokenId}`);
      return res.status(400).json({ error: 'Invalid token ID' });
    }
    
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Define paths for image and metadata
    const imagePath = path.join(imageDir, `${id}.png`);
    // Use an absolute URL that works with the static file serving
    const imageUrl = `http://localhost:${PORT}/public/nfts/images/${id}.png`;
    
    console.log(`Image path: ${imagePath}`);
    console.log(`Image URL: ${imageUrl}`);
    
    // Generate the NFT art if it doesn't exist
    if (!fs.existsSync(imagePath)) {
      console.log(`Generating NFT art for token ID: ${id}`);
      try {
        generateNFTArt(id, imagePath);
        console.log(`NFT art generated successfully: ${imagePath}`);
      } catch (artError) {
        console.error(`Error generating NFT art: ${artError.message}`);
        return res.status(500).json({ 
          error: 'Failed to generate NFT art', 
          message: artError.message
        });
      }
    } else {
      console.log(`NFT art already exists: ${imagePath}`);
    }
    
    // Verify the image was created successfully
    if (!fs.existsSync(imagePath)) {
      console.error(`Failed to generate or find NFT art: ${imagePath}`);
      return res.status(500).json({ error: 'Failed to generate NFT art' });
    }
    
    // Generate random attributes based on token ID
    const seed = id;
    const rand = (max) => {
      const x = Math.sin(seed * 9999 + max) * 10000;
      return (x - Math.floor(x)) * max;
    };
    
    // Create NFT metadata with dynamic attributes
    const rarityLevel = Math.floor(rand(100));
    let rarity;
    
    if (rarityLevel < 50) rarity = 'Common';
    else if (rarityLevel < 80) rarity = 'Uncommon';
    else if (rarityLevel < 95) rarity = 'Rare';
    else rarity = 'Legendary';
    
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
          value: ['Solid', 'Gradient', 'Grid', 'Circles'][Math.floor(rand(4))]
        },
        {
          trait_type: 'Shape Count',
          value: 5 + Math.floor(rand(15))
        },
        {
          display_type: 'boost_percentage',
          trait_type: 'Artistic Value',
          value: Math.floor(rand(100))
        }
      ]
    };
    
    console.log(`Returning metadata for token ID: ${id}`);
    // Return the metadata
    res.json(metadata);
  } catch (error) {
    console.error(`Error generating NFT metadata for token ID ${tokenId}:`, error);
    res.status(500).json({ 
      error: 'Failed to generate NFT metadata', 
      message: error.message
    });
  }
});

// Debug endpoint to check if an image exists
app.get('/debug/image/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  const id = parseInt(tokenId);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }
  
  const imagePath = path.join(imageDir, `${id}.png`);
  
  const result = {
    tokenId: id,
    imageDir: imageDir,
    imagePath: imagePath,
    imageExists: fs.existsSync(imagePath),
    metadataDirExists: fs.existsSync(metadataDir),
    imageDirExists: fs.existsSync(imageDir),
    publicDirExists: fs.existsSync(publicDir),
    serverRoot: __dirname,
    imageUrl: `http://localhost:${PORT}/public/nfts/images/${id}.png`
  };
  
  res.json(result);
});

// Endpoint to force generate an image
app.get('/generate-image/:tokenId', (req, res) => {
  const tokenId = req.params.tokenId;
  const id = parseInt(tokenId);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }
  
  try {
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Define path for image
    const imagePath = path.join(imageDir, `${id}.png`);
    
    // Generate the NFT art (force regenerate)
    console.log(`Force generating NFT art for token ID: ${id}`);
    generateNFTArt(id, imagePath);
    
    // Return success with image details
    res.json({
      success: true,
      tokenId: id,
      imagePath: imagePath,
      imageUrl: `http://localhost:${PORT}/public/nfts/images/${id}.png`,
      imageExists: fs.existsSync(imagePath)
    });
  } catch (error) {
    console.error(`Error generating image for token ID ${tokenId}:`, error);
    res.status(500).json({ 
      error: 'Failed to generate image', 
      message: error.message
    });
  }
});

// Endpoint to list all generated NFTs
app.get('/api/nfts', (req, res) => {
  try {
    // Ensure the image directory exists
    if (!fs.existsSync(imageDir)) {
      return res.json({ nfts: [] });
    }
    
    // Read all files in the images directory
    const files = fs.readdirSync(imageDir);
    
    // Filter for PNG files and extract token IDs
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

// Start the server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`NFT Server started successfully on port ${PORT}!`);
  console.log('='.repeat(50));
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`NFT minting interface: http://localhost:${PORT}`);
  console.log(`NFT metadata API: http://localhost:${PORT}/api/nft/{tokenId}`);
  console.log(`Debug image endpoint: http://localhost:${PORT}/debug/image/{tokenId}`);
  console.log(`Force generate image: http://localhost:${PORT}/generate-image/{tokenId}`);
  console.log(`List all NFTs: http://localhost:${PORT}/api/nfts`);
  console.log('='.repeat(50));
  console.log(`IMPORTANT: Set your contract's baseURI to: http://localhost:${PORT}/api/nft/`);
  console.log('='.repeat(50));
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});
