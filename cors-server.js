const express = require('express');
const path = require('path');
const fs = require('fs');
const PinataSDK = require('@pinata/sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 4000;

// CORS middleware - must be before any routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable JSON parsing
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Initialize Pinata client if API keys or JWT are available
let pinata = null;
try {
  // Check for JWT first (preferred method)
  if (process.env.PINATA_JWT) {
    console.log('Attempting to initialize Pinata with JWT...');
    pinata = new PinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
    console.log('Pinata client initialized successfully using JWT');
    
    // Test the Pinata connection
    pinata.testAuthentication().then((result) => {
      console.log('Pinata authentication test result:', result);
    }).catch((err) => {
      console.error('Pinata authentication test failed:', err);
    });
  } 
  // Fall back to API key/secret if JWT not available
  else if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
    console.log('Attempting to initialize Pinata with API key/secret...');
    pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
    console.log('Pinata client initialized successfully using API key/secret');
    
    // Test the Pinata connection
    pinata.testAuthentication().then((result) => {
      console.log('Pinata authentication test result:', result);
    }).catch((err) => {
      console.error('Pinata authentication test failed:', err);
    });
  } else {
    console.log('Pinata credentials not found, IPFS pinning will be disabled');
  }
} catch (error) {
  console.error('Error initializing Pinata client:', error);
}

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

// Create some placeholder images if they don't exist
for (let i = 1; i <= 3; i++) {
  const imagePath = path.join(imagesDir, `${i}.png`);
  if (!fs.existsSync(imagePath)) {
    // Create a simple text file as a placeholder
    fs.writeFileSync(imagePath, `Placeholder for NFT #${i} image`);
    console.log(`Created placeholder image: ${imagePath}`);
  }
}

// Serve simple-nft.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-nft.html'));
});

// Also serve nft-fixed.html
app.get('/nft-fixed', (req, res) => {
  res.sendFile(path.join(__dirname, 'nft-fixed.html'));
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
    image: `/public/nfts/images/${tokenId % 3 + 1}.png`,
    attributes: [
      { trait_type: 'Token ID', value: tokenId.toString() },
      { trait_type: 'Collection', value: 'MockNFT' },
      { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare'][Math.floor(Math.random() * 3)] }
    ]
  };
  
  res.json(metadata);
});

// === MOCK API ENDPOINTS ===

// Get contract owner
app.get('/api/mock/owner', (req, res) => {
  console.log('GET /api/mock/owner');
  res.json({ owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' });
});

// Get mint price
app.get('/api/mock/mintPrice', (req, res) => {
  console.log('GET /api/mock/mintPrice');
  res.json({ mintPrice: '10000000000000000' }); // 0.01 ETH in wei
});

// Mock NFT data
const mockNFTs = {
  tokens: {},
  owners: {},
  balances: {},
  ownership: {}, // For backward compatibility
  nextTokenId: 4 // Start after our initial 3 NFTs
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
  
  // Initialize empty collections for test addresses
  const testAddresses = [
    '0xa7630fa60bc186bcb171c80dacc953685bf975a6',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  ];
  
  testAddresses.forEach(address => {
    mockNFTs.owners[address] = [];
    mockNFTs.ownership[address] = [];
    mockNFTs.balances[address] = 0;
  });
}

// Run initialization
initializeMockData();

// Function to pin content to IPFS using Pinata
async function pinToIPFS(content, name) {
  if (!pinata) {
    console.log('Pinata client not initialized, skipping IPFS pinning');
    return null;
  }
  
  console.log(`Attempting to pin content to IPFS with name: ${name}`);
  console.log('Content to pin:', JSON.stringify(content, null, 2));
  
  try {
    const options = {
      pinataMetadata: {
        name: name
      }
    };
    
    console.log('Pinata options:', JSON.stringify(options, null, 2));
    console.log('Using JWT authentication:', !!process.env.PINATA_JWT);
    
    // Test authentication before attempting to pin
    const authTest = await pinata.testAuthentication();
    console.log('Authentication test before pinning:', authTest);
    
    // Pin the content
    const result = await pinata.pinJSONToIPFS(content, options);
    console.log('Pinata API response:', JSON.stringify(result, null, 2));
    console.log(`Successfully pinned to IPFS with hash: ${result.IpfsHash}`);
    
    // Return the IPFS hash
    return result.IpfsHash;
  } catch (error) {
    console.error('Error pinning to IPFS. Full error details:', error);
    if (error.response && error.response.data) {
      console.error('Pinata API error response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Mint a new NFT
app.post('/api/mock/mint', async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ success: false, error: 'Address is required' });
  }
  
  try {
    console.log(`Minting new NFT for address: ${address}`);
    const tokenId = mockNFTs.nextTokenId++;
    
    // Create metadata for the new NFT
    const metadata = {
      name: `NFT #${tokenId}`,
      description: `This is a mock NFT with ID ${tokenId}`,
      image: `/public/nfts/images/${tokenId % 3 + 1}.png`, // Cycle through our 3 example images
      attributes: [
        { trait_type: 'Token ID', value: tokenId.toString() },
        { trait_type: 'Collection', value: 'MockNFT' },
        { trait_type: 'Minted', value: new Date().toISOString() },
        { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare'][Math.floor(Math.random() * 3)] }
      ]
    };
    
    console.log(`Created metadata for NFT #${tokenId}:`, JSON.stringify(metadata, null, 2));
    
    // Pin metadata to IPFS if Pinata is available
    let ipfsHash = null;
    let ipfsUrl = null;
    
    if (pinata) {
      console.log('Pinata client is available, attempting to pin metadata to IPFS...');
      ipfsHash = await pinToIPFS(metadata, `NFT #${tokenId}`);
      
      if (ipfsHash) {
        console.log(`Successfully pinned NFT #${tokenId} to IPFS with hash: ${ipfsHash}`);
        ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        metadata.ipfsHash = ipfsHash;
        metadata.ipfsUrl = ipfsUrl;
      } else {
        console.warn(`Failed to pin NFT #${tokenId} to IPFS, continuing without IPFS integration`);
      }
    } else {
      console.log('Pinata client not available, skipping IPFS pinning');
    }
    
    // Store the NFT metadata
    mockNFTs.tokens[tokenId] = metadata;
    
    // Add to the owner's collection
    if (!mockNFTs.owners[address]) {
      mockNFTs.owners[address] = [];
    }
    mockNFTs.owners[address].push(tokenId);
    
    // Update balance
    mockNFTs.balances[address] = (mockNFTs.balances[address] || 0) + 1;
    
    console.log(`Successfully minted NFT #${tokenId} for ${address}`);
    
    // Send detailed response
    res.json({
      success: true,
      tokenId,
      ipfsHash,
      ipfsUrl,
      metadata: metadata
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mint NFT', 
      details: error.message || 'Unknown error'
    });
  }
});

// Get balance of address
app.get('/api/mock/balanceOf/:address', (req, res) => {
  try {
    const { address } = req.params;
    console.log(`Getting balance for address: ${address}`);
    
    // Calculate balance from owners array
    const balance = mockNFTs.owners[address] ? mockNFTs.owners[address].length : 0;
    console.log(`Balance for ${address}: ${balance} NFTs`);
    
    res.json({ balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Failed to get balance', details: error.message });
  }
});

// Get token of owner by index
app.get('/api/mock/tokenOfOwnerByIndex/:address/:index', (req, res) => {
  try {
    const { address, index } = req.params;
    const indexNum = parseInt(index, 10);
    
    console.log(`Getting token at index ${indexNum} for address: ${address}`);
    
    const tokens = mockNFTs.owners[address] || [];
    
    if (indexNum >= tokens.length) {
      console.log(`Index ${indexNum} out of bounds for address ${address} with ${tokens.length} tokens`);
      return res.status(404).json({ error: 'Token index out of bounds' });
    }
    
    const tokenId = tokens[indexNum];
    console.log(`Token at index ${indexNum} for address ${address}: ${tokenId}`);
    res.json({ tokenId });
  } catch (error) {
    console.error('Error getting token by index:', error);
    res.status(500).json({ error: 'Failed to get token', details: error.message });
  }
});

// Get token URI
app.get('/api/mock/tokenURI/:tokenId', (req, res) => {
  try {
    const { tokenId } = req.params;
    console.log(`Getting token URI for token ID: ${tokenId}`);
    
    const metadata = mockNFTs.tokens[tokenId];
    
    if (!metadata) {
      console.log(`Token ID ${tokenId} not found`);
      return res.status(404).json({ error: 'Token not found' });
    }
    
    console.log(`Found metadata for token ID ${tokenId}`);
    res.json({ tokenURI: JSON.stringify(metadata) });
  } catch (error) {
    console.error('Error getting token URI:', error);
    res.status(500).json({ error: 'Failed to get token URI', details: error.message });
  }
});

// Pinata status check
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

// Start the server
app.listen(PORT, () => {
  console.log(`Mock NFT server running at http://localhost:${PORT}`);
  console.log(`NFT interface available at: http://localhost:${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
  console.log(`Test NFT metadata at: http://localhost:${PORT}/api/nft/1`);
  
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
