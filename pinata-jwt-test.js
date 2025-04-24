/**
 * Pinata JWT Test
 * 
 * This script tests the connection to Pinata using the JWT authentication method
 * which is more reliable than API key/secret for newer Pinata accounts.
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Get JWT from environment variables
const jwt = process.env.PINATA_JWT;

console.log('='.repeat(50));
console.log('Pinata IPFS JWT Test');
console.log('='.repeat(50));

// Test authentication and upload using JWT
async function testPinataWithJWT() {
  try {
    console.log('\nTesting Pinata connection with JWT...');
    
    // Test authentication
    const authResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    
    console.log('Authentication response:', authResponse.data);
    console.log('\n✅ Pinata JWT authentication successful!');
    
    // Upload test metadata
    console.log('\nUploading test metadata...');
    const metadata = {
      name: 'Test NFT via JWT',
      description: 'Testing Pinata integration with JWT',
      timestamp: new Date().toISOString()
    };
    
    const pinataMetadata = {
      name: 'test-nft-metadata-jwt'
    };
    
    const jsonResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: metadata,
        pinataMetadata: pinataMetadata
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      }
    );
    
    console.log('\nMetadata uploaded successfully!');
    console.log('IPFS Hash:', jsonResponse.data.IpfsHash);
    console.log('View at:', `https://gateway.pinata.cloud/ipfs/${jsonResponse.data.IpfsHash}`);
    
    // Create a simple SVG for testing file uploads
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <rect width="500" height="500" fill="#3498db" />
      <circle cx="250" cy="250" r="100" fill="#e74c3c" />
      <text x="250" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="white">NFT Test</text>
      <text x="250" y="280" font-family="Arial" font-size="16" text-anchor="middle" fill="white">${new Date().toISOString()}</text>
    </svg>`;
    
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Save the SVG to a file
    const svgPath = path.join(assetsDir, `test-nft-${Date.now()}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    console.log(`\n🖼️ Created test SVG image at: ${svgPath}`);
    
    // Upload the SVG file
    console.log('\nUploading test image file...');
    
    const formData = new FormData();
    
    // Add the file to the form data
    const fileStream = fs.createReadStream(svgPath);
    formData.append('file', fileStream);
    
    // Add the pinataMetadata to the form data
    const metadata_for_file = JSON.stringify({
      name: `test-nft-image-${Date.now()}`
    });
    formData.append('pinataMetadata', metadata_for_file);
    
    // Make the request to pin the file
    const fileResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('\nImage file uploaded successfully!');
    console.log('IPFS Hash:', fileResponse.data.IpfsHash);
    console.log('View at:', `https://gateway.pinata.cloud/ipfs/${fileResponse.data.IpfsHash}`);
    
    // Create complete NFT metadata with image link
    console.log('\nCreating and uploading complete NFT metadata...');
    
    const nftMetadata = {
      name: `Complete Test NFT ${Date.now()}`,
      description: 'A complete NFT with image and metadata',
      image: `ipfs://${fileResponse.data.IpfsHash}`,
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Shape', value: 'Circle' },
        { trait_type: 'Created', value: new Date().toISOString() }
      ]
    };
    
    const completeResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: nftMetadata,
        pinataMetadata: {
          name: `complete-nft-metadata-${Date.now()}`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      }
    );
    
    console.log('\nComplete NFT metadata uploaded successfully!');
    console.log('IPFS Hash:', completeResponse.data.IpfsHash);
    console.log('View at:', `https://gateway.pinata.cloud/ipfs/${completeResponse.data.IpfsHash}`);
    console.log('\nFor smart contract use:', `ipfs://${completeResponse.data.IpfsHash}`);
    
    // Save the result to a JSON file
    const result = {
      image: {
        hash: fileResponse.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${fileResponse.data.IpfsHash}`,
        ipfsUrl: `ipfs://${fileResponse.data.IpfsHash}`
      },
      metadata: {
        hash: completeResponse.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${completeResponse.data.IpfsHash}`,
        ipfsUrl: `ipfs://${completeResponse.data.IpfsHash}`
      },
      nftData: nftMetadata
    };
    
    const resultPath = path.join(assetsDir, `nft-result-${Date.now()}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Result saved to: ${resultPath}`);
    
    console.log('\n🎉 Pinata integration is working correctly!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPinataWithJWT();
