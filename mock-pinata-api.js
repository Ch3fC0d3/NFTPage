/**
 * Mock Pinata API for NFT Development
 * 
 * This script extends your mock API server with Pinata IPFS-like functionality
 * for local development without requiring actual Pinata credentials.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create Express app
const app = express();
const PORT = 4001; // Using a different port to avoid conflicts

// Enable CORS for all routes
app.use(cors());

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage for mock IPFS pins
const mockPins = {};

// Generate a mock IPFS hash (similar format to real IPFS hashes)
function generateMockIpfsHash() {
  return 'Qm' + crypto.randomBytes(44).toString('hex');
}

// Mock Pinata authentication endpoint
app.get('/api/pinata/test', (req, res) => {
  console.log('Mock Pinata: Testing authentication');
  res.json({
    authenticated: true,
    message: 'Mock Pinata authentication successful'
  });
});

// Mock endpoint for pinning JSON to IPFS
app.post('/api/pinata/pinJSON', (req, res) => {
  try {
    const { metadata, options } = req.body;
    
    if (!metadata) {
      return res.status(400).json({ error: 'Metadata is required' });
    }
    
    const hash = generateMockIpfsHash();
    const timestamp = new Date().toISOString();
    
    // Store the pinned content
    mockPins[hash] = {
      content: metadata,
      options: options || {},
      timestamp,
      type: 'json'
    };
    
    console.log(`Mock Pinata: Pinned JSON with hash: ${hash}`);
    res.json({
      IpfsHash: hash,
      PinSize: JSON.stringify(metadata).length,
      Timestamp: timestamp
    });
  } catch (error) {
    console.error('Error pinning JSON:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mock endpoint for pinning files to IPFS
app.post('/api/pinata/pinFile', (req, res) => {
  try {
    const { fileContent, fileName, options } = req.body;
    
    if (!fileContent) {
      return res.status(400).json({ error: 'File content is required' });
    }
    
    const hash = generateMockIpfsHash();
    const timestamp = new Date().toISOString();
    
    // Create directories if they don't exist
    const publicDir = path.join(__dirname, 'public');
    const nftsDir = path.join(publicDir, 'nfts');
    const imagesDir = path.join(nftsDir, 'images');
    
    [publicDir, nftsDir, imagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // If it's an SVG, save it to the images directory
    if (fileContent.startsWith('<svg') && fileName) {
      const filePath = path.join(imagesDir, fileName);
      fs.writeFileSync(filePath, fileContent);
      console.log(`Saved SVG file to: ${filePath}`);
    }
    
    // Store the pinned content
    mockPins[hash] = {
      content: fileContent,
      fileName: fileName || 'unknown',
      options: options || {},
      timestamp,
      type: 'file'
    };
    
    console.log(`Mock Pinata: Pinned file with hash: ${hash}`);
    res.json({
      IpfsHash: hash,
      PinSize: fileContent.length,
      Timestamp: timestamp
    });
  } catch (error) {
    console.error('Error pinning file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mock IPFS gateway to serve pinned content
app.get('/ipfs/:hash', (req, res) => {
  const { hash } = req.params;
  const pin = mockPins[hash];
  
  if (!pin) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  if (pin.type === 'json') {
    res.json(pin.content);
  } else if (pin.type === 'file') {
    // For SVG content
    if (pin.content.startsWith('<svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    res.send(pin.content);
  } else {
    res.status(400).json({ error: 'Unknown content type' });
  }
});

// Get list of pinned items
app.get('/api/pinata/pins', (req, res) => {
  const pins = Object.entries(mockPins).map(([hash, data]) => ({
    ipfs_pin_hash: hash,
    size: data.content.length,
    date_pinned: data.timestamp,
    metadata: data.options?.pinataMetadata || { name: 'Unknown' },
    type: data.type
  }));
  
  res.json({
    count: pins.length,
    rows: pins
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Mock Pinata IPFS Server running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log('- GET  /api/pinata/test - Test authentication');
  console.log('- POST /api/pinata/pinJSON - Pin JSON to mock IPFS');
  console.log('- POST /api/pinata/pinFile - Pin file to mock IPFS');
  console.log('- GET  /ipfs/:hash - Access pinned content');
  console.log('- GET  /api/pinata/pins - List all pins');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
