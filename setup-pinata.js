/**
 * Pinata Setup Helper
 * 
 * This script helps you set up your Pinata credentials in the .env file.
 * It will create or update your .env file with the provided credentials.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Function to read existing .env file
function readEnvFile() {
  try {
    if (fs.existsSync(envPath)) {
      return fs.readFileSync(envPath, 'utf8');
    }
    return '';
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return '';
  }
}

// Function to update or create .env file with Pinata credentials
function updateEnvFile(apiKey, apiSecret) {
  try {
    let envContent = readEnvFile();
    
    // Check if Pinata credentials already exist in the file
    const apiKeyRegex = /PINATA_API_KEY=.*/;
    const apiSecretRegex = /PINATA_API_SECRET=.*/;
    
    if (apiKeyRegex.test(envContent)) {
      // Update existing API key
      envContent = envContent.replace(apiKeyRegex, `PINATA_API_KEY=${apiKey}`);
    } else {
      // Add new API key
      envContent += `\nPINATA_API_KEY=${apiKey}`;
    }
    
    if (apiSecretRegex.test(envContent)) {
      // Update existing API secret
      envContent = envContent.replace(apiSecretRegex, `PINATA_API_SECRET=${apiSecret}`);
    } else {
      // Add new API secret
      envContent += `\nPINATA_API_SECRET=${apiSecret}`;
    }
    
    // Write updated content to .env file
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    console.log('\n✅ Pinata credentials successfully added to .env file!');
    console.log(`📁 File location: ${envPath}`);
  } catch (error) {
    console.error('Error updating .env file:', error.message);
  }
}

// Main function to prompt for credentials and update .env file
function setupPinata() {
  console.log('='.repeat(50));
  console.log('🌟 Pinata IPFS Setup Helper');
  console.log('='.repeat(50));
  console.log('\nThis script will help you set up your Pinata credentials.');
  console.log('You can find your API key and secret in your Pinata account dashboard.');
  console.log('\n1. Go to https://app.pinata.cloud/');
  console.log('2. Sign in to your account');
  console.log('3. Navigate to API Keys section');
  console.log('4. Create a new API key or use an existing one');
  console.log('\nEnter your Pinata credentials below:');
  
  rl.question('\nPinata API Key: ', (apiKey) => {
    if (!apiKey.trim()) {
      console.log('❌ API Key cannot be empty. Aborting setup.');
      rl.close();
      return;
    }
    
    rl.question('Pinata API Secret: ', (apiSecret) => {
      if (!apiSecret.trim()) {
        console.log('❌ API Secret cannot be empty. Aborting setup.');
        rl.close();
        return;
      }
      
      // Update .env file with provided credentials
      updateEnvFile(apiKey.trim(), apiSecret.trim());
      
      console.log('\n🔍 Testing connection to Pinata...');
      
      // Test the connection with the provided credentials
      const { testConnection } = require('./pinata-real.js');
      testConnection()
        .then(success => {
          if (success) {
            console.log('\n🎉 Setup complete! Your Pinata integration is ready to use.');
            console.log('\nYou can now use the pinata-real.js module to upload NFT images and metadata.');
          } else {
            console.log('\n⚠️ Setup completed but connection test failed.');
            console.log('Please check your credentials and try again.');
          }
          rl.close();
        })
        .catch(error => {
          console.error('\n❌ Error testing connection:', error.message);
          rl.close();
        });
    });
  });
}

// Run the setup
setupPinata();
