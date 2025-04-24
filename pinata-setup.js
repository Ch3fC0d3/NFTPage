/**
 * Pinata IPFS Setup and Test Tool
 * 
 * This script helps you set up and test your Pinata IPFS integration:
 * 1. Verifies your Pinata credentials are properly configured
 * 2. Tests the connection to Pinata
 * 3. Creates a sample NFT image and metadata
 * 4. Uploads them to IPFS via Pinata
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to print colored text
function print(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

// Helper function to print section headers
function printHeader(text) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(50) + colors.reset);
  console.log(colors.bright + colors.cyan + text + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(50) + colors.reset);
}

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  printHeader('NFT PINATA IPFS SETUP AND TEST TOOL');
  print('This tool will help you set up and test your Pinata IPFS integration.', 'bright');
  
  // Step 1: Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    print('\n❌ .env file not found!', 'red');
    print('Creating a new .env file...', 'yellow');
    
    // Copy from .env.example if it exists
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      print('✅ .env file created from .env.example', 'green');
    } else {
      // Create a basic .env file
      fs.writeFileSync(envPath, '# NFT Project Environment Variables\n\n');
      print('✅ Created a new empty .env file', 'green');
    }
  } else {
    print('\n✅ .env file found', 'green');
  }
  
  // Load environment variables
  require('dotenv').config();
  
  // Step 2: Check Pinata credentials
  printHeader('CHECKING PINATA CREDENTIALS');
  let apiKey = process.env.PINATA_API_KEY;
  let apiSecret = process.env.PINATA_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    print('❌ Pinata credentials not found in .env file', 'red');
    print('Let\'s set them up now:', 'yellow');
    
    apiKey = await ask('Enter your Pinata API Key: ');
    apiSecret = await ask('Enter your Pinata API Secret: ');
    
    // Update .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('PINATA_API_KEY=')) {
      // Replace existing credentials
      envContent = envContent.replace(/PINATA_API_KEY=.*/g, `PINATA_API_KEY=${apiKey}`);
      envContent = envContent.replace(/PINATA_API_SECRET=.*/g, `PINATA_API_SECRET=${apiSecret}`);
    } else {
      // Add new credentials
      envContent += '\n# Pinata IPFS Pinning Service\n';
      envContent += `PINATA_API_KEY=${apiKey}\n`;
      envContent += `PINATA_API_SECRET=${apiSecret}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    print('\n✅ Pinata credentials saved to .env file', 'green');
    
    // Reload environment variables
    require('dotenv').config();
  } else {
    print('✅ Pinata credentials found in .env file', 'green');
    print(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`, 'dim');
    print(`API Secret: ${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`, 'dim');
  }
  
  // Step 3: Test Pinata connection
  printHeader('TESTING PINATA CONNECTION');
  try {
    print('Importing Pinata SDK...', 'yellow');
    const PinataSDK = require('@pinata/sdk');
    print('✅ Pinata SDK imported successfully', 'green');
    
    print('\nInitializing Pinata client...', 'yellow');
    const pinata = new PinataSDK({
      pinataApiKey: apiKey,
      pinataSecretApiKey: apiSecret
    });
    print('✅ Pinata client initialized', 'green');
    
    print('\nTesting authentication...', 'yellow');
    try {
      const result = await pinata.testAuthentication();
      print('\n✅ Authentication successful!', 'green');
      print(JSON.stringify(result, null, 2), 'dim');
    } catch (authError) {
      print(`\n❌ Authentication failed: ${authError.message}`, 'red');
      print('Please check your Pinata credentials and try again.', 'yellow');
      rl.close();
      return;
    }
    
    // Step 4: Create sample NFT files
    printHeader('CREATING SAMPLE NFT FILES');
    
    // Create directories if they don't exist
    const publicDir = path.join(__dirname, 'public');
    const nftsDir = path.join(publicDir, 'nfts');
    const imagesDir = path.join(nftsDir, 'images');
    
    [publicDir, nftsDir, imagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        print(`Created directory: ${dir}`, 'dim');
      }
    });
    
    // Create a simple SVG image for the NFT
    const sampleNftId = Date.now().toString().substring(7); // Use timestamp for unique ID
    const svgImage = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <circle cx="250" cy="250" r="100" fill="#4B2996"/>
      <text x="250" y="250" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">NFT #${sampleNftId}</text>
      <text x="250" y="290" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Created: ${new Date().toISOString()}</text>
    </svg>`;
    
    const imagePath = path.join(imagesDir, `nft-${sampleNftId}.svg`);
    fs.writeFileSync(imagePath, svgImage);
    print(`✅ Created sample NFT image: ${imagePath}`, 'green');
    
    // Create metadata for the NFT
    const metadata = {
      name: `Sample NFT #${sampleNftId}`,
      description: "This is a sample NFT created by the Pinata setup tool",
      image: "", // Will be updated after uploading
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
    
    const metadataPath = path.join(nftsDir, `metadata-${sampleNftId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    print(`✅ Created sample NFT metadata: ${metadataPath}`, 'green');
    
    // Step 5: Upload to IPFS
    printHeader('UPLOADING TO IPFS VIA PINATA');
    
    print('Uploading image to IPFS...', 'yellow');
    const readableStreamForFile = fs.createReadStream(imagePath);
    const imageOptions = {
      pinataMetadata: {
        name: `NFT Image #${sampleNftId}`
      }
    };
    
    try {
      const imageResult = await pinata.pinFileToIPFS(readableStreamForFile, imageOptions);
      print(`✅ Image uploaded to IPFS with hash: ${imageResult.IpfsHash}`, 'green');
      
      // Update metadata with IPFS image URL
      metadata.image = `ipfs://${imageResult.IpfsHash}`;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      print(`✅ Updated metadata with IPFS image URL`, 'green');
      
      // Upload metadata to IPFS
      print('\nUploading metadata to IPFS...', 'yellow');
      const metadataOptions = {
        pinataMetadata: {
          name: `NFT Metadata #${sampleNftId}`
        }
      };
      
      const metadataResult = await pinata.pinJSONToIPFS(metadata, metadataOptions);
      print(`✅ Metadata uploaded to IPFS with hash: ${metadataResult.IpfsHash}`, 'green');
      
      // Success message
      printHeader('SUCCESS! PINATA IPFS INTEGRATION IS WORKING');
      print('Your Pinata IPFS integration is working correctly!', 'green');
      print('\nSample NFT Details:', 'bright');
      print(`- NFT ID: ${sampleNftId}`, 'cyan');
      print(`- Image IPFS URI: ipfs://${imageResult.IpfsHash}`, 'cyan');
      print(`- Image HTTP URL: https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`, 'cyan');
      print(`- Metadata IPFS URI: ipfs://${metadataResult.IpfsHash}`, 'cyan');
      print(`- Metadata HTTP URL: https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`, 'cyan');
      
      print('\nTo use this NFT in your smart contract, use the metadata IPFS URI as the tokenURI.', 'yellow');
      print('Example: contract.safeMint(address, "ipfs://' + metadataResult.IpfsHash + '");', 'dim');
      
      print('\nYou can view your NFT on IPFS via the HTTP URLs above.', 'yellow');
    } catch (uploadError) {
      print(`\n❌ Error uploading to IPFS: ${uploadError.message}`, 'red');
      print('Please check your Pinata credentials and internet connection.', 'yellow');
    }
  } catch (error) {
    print(`\n❌ Error: ${error.message}`, 'red');
    if (error.message.includes('Cannot find module')) {
      print('\nTrying to install @pinata/sdk...', 'yellow');
      print('Please run this command and try again:', 'yellow');
      print('npm install @pinata/sdk', 'bright');
    }
  }
  
  rl.close();
}

// Run the main function
main().catch(error => {
  print(`\n❌ Unexpected error: ${error.message}`, 'red');
  rl.close();
});
