/**
 * Simple Pinata IPFS Upload Script
 * 
 * This script uploads a sample NFT image and metadata to IPFS via Pinata.
 */

// Load environment variables
require('dotenv').config();

// Import required modules
const fs = require('fs');
const path = require('path');
const pinataSDK = require('@pinata/sdk');

// Initialize Pinata client with API keys from .env
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET
});

// Create a simple SVG image for the NFT
async function createAndUploadNFT() {
  console.log('Starting Pinata IPFS upload process...');
  
  try {
    // Test Pinata connection first
    console.log('Testing Pinata connection...');
    const authResult = await pinata.testAuthentication();
    console.log('✅ Pinata connection successful:', authResult);
    
    // Create directories if they don't exist
    const publicDir = path.join(__dirname, 'public');
    const nftsDir = path.join(publicDir, 'nfts');
    const imagesDir = path.join(nftsDir, 'images');
    
    [publicDir, nftsDir, imagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
    
    // Create a unique ID for the NFT
    const nftId = Date.now().toString().substring(7);
    
    // Create a simple SVG image
    const svgImage = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <circle cx="250" cy="250" r="100" fill="#4B2996"/>
      <text x="250" y="250" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">NFT #${nftId}</text>
      <text x="250" y="290" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Created: ${new Date().toISOString()}</text>
    </svg>`;
    
    const imagePath = path.join(imagesDir, `nft-${nftId}.svg`);
    fs.writeFileSync(imagePath, svgImage);
    console.log(`✅ Created sample NFT image: ${imagePath}`);
    
    // Upload image to IPFS
    console.log('\nUploading image to IPFS...');
    const readableStreamForFile = fs.createReadStream(imagePath);
    const imageOptions = {
      pinataMetadata: {
        name: `NFT Image #${nftId}`
      }
    };
    
    const imageResult = await pinata.pinFileToIPFS(readableStreamForFile, imageOptions);
    console.log(`✅ Image uploaded to IPFS with hash: ${imageResult.IpfsHash}`);
    console.log(`Image URL: https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`);
    
    // Create metadata for the NFT
    const metadata = {
      name: `Sample NFT #${nftId}`,
      description: "This is a sample NFT created with Pinata IPFS",
      image: `ipfs://${imageResult.IpfsHash}`,
      attributes: [
        {
          trait_type: "Sample",
          value: "Test"
        },
        {
          trait_type: "Created",
          value: new Date().toISOString().split('T')[0]
        }
      ]
    };
    
    // Upload metadata to IPFS
    console.log('\nUploading metadata to IPFS...');
    const metadataOptions = {
      pinataMetadata: {
        name: `NFT Metadata #${nftId}`
      }
    };
    
    const metadataResult = await pinata.pinJSONToIPFS(metadata, metadataOptions);
    console.log(`✅ Metadata uploaded to IPFS with hash: ${metadataResult.IpfsHash}`);
    console.log(`Metadata URL: https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`);
    
    // Success message
    console.log('\n==============================================');
    console.log('✅ SUCCESS! PINATA IPFS INTEGRATION IS WORKING');
    console.log('==============================================');
    console.log('\nSample NFT Details:');
    console.log(`- NFT ID: ${nftId}`);
    console.log(`- Image IPFS URI: ipfs://${imageResult.IpfsHash}`);
    console.log(`- Image HTTP URL: https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`);
    console.log(`- Metadata IPFS URI: ipfs://${metadataResult.IpfsHash}`);
    console.log(`- Metadata HTTP URL: https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`);
    
    console.log('\nTo use this NFT in your smart contract, use the metadata IPFS URI as the tokenURI.');
    console.log(`Example: contract.safeMint(address, "ipfs://${metadataResult.IpfsHash}");`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid API key') || error.message.includes('Invalid API secret')) {
      console.log('\nPlease check your Pinata API credentials in the .env file.');
    }
  }
}

// Run the function
createAndUploadNFT();
