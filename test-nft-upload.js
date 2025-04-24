/**
 * Test NFT Upload to Pinata IPFS
 * 
 * This script creates a sample NFT image and uploads it to Pinata IPFS
 * along with its metadata. It demonstrates the complete NFT creation flow.
 */

const fs = require('fs');
const path = require('path');
const pinata = require('./pinata-real.js');

// Create sample directories if they don't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple SVG image for testing
function createSampleNFT() {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
    '#33FFF5', '#F5FF33', '#FF8C33', '#8C33FF', '#33FFCB'
  ];
  
  // Generate random colors
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  const fgColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Create a simple SVG with random elements
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <rect width="500" height="500" fill="${bgColor}" />
    <circle cx="250" cy="250" r="100" fill="${fgColor}" />
    <text x="250" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="white">NFT #${Date.now()}</text>
    <text x="250" y="280" font-family="Arial" font-size="16" text-anchor="middle" fill="white">${new Date().toISOString()}</text>
  </svg>`;
  
  // Save the SVG to a file
  const filePath = path.join(assetsDir, `nft-${Date.now()}.svg`);
  fs.writeFileSync(filePath, svgContent);
  
  console.log(`\n🖼️ Sample NFT image created at: ${filePath}`);
  return filePath;
}

// Main function to test the NFT upload process
async function testNFTUpload() {
  console.log('='.repeat(50));
  console.log('🚀 Testing NFT Upload to Pinata IPFS');
  console.log('='.repeat(50));
  
  // Test Pinata connection first
  const connected = await pinata.testConnection();
  
  if (!connected) {
    console.error('\n❌ Cannot proceed with upload test due to connection failure.');
    console.log('Please run setup-pinata.js to configure your credentials.');
    return;
  }
  
  // Create a sample NFT image
  const imagePath = createSampleNFT();
  
  // Create NFT attributes
  const attributes = {
    name: `Test NFT #${Date.now()}`,
    description: 'A test NFT created with our NFT management system',
    traits: [
      { trait_type: 'Background', value: 'Colorful' },
      { trait_type: 'Shape', value: 'Circle' },
      { trait_type: 'Timestamp', value: new Date().toISOString() }
    ]
  };
  
  console.log('\n📤 Uploading NFT to Pinata IPFS...');
  
  // Upload the NFT image and metadata to IPFS
  const result = await pinata.createNFT(imagePath, attributes);
  
  if (result) {
    console.log('\n🎉 NFT successfully created and uploaded to IPFS!');
    console.log('\n📋 NFT Details:');
    console.log(`Name: ${attributes.name}`);
    console.log(`Description: ${attributes.description}`);
    console.log('\n🔗 IPFS Links:');
    console.log(`Image: ${result.image.url}`);
    console.log(`Metadata: ${result.metadata.url}`);
    console.log('\n📝 For smart contract:');
    console.log(`Token URI: ${result.metadata.ipfsUrl}`);
    
    // Save the result to a JSON file for reference
    const resultPath = path.join(assetsDir, `nft-result-${Date.now()}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Result saved to: ${resultPath}`);
  } else {
    console.error('\n❌ Failed to create and upload NFT.');
  }
}

// Run the test
testNFTUpload();
