// Helper script for connecting to Hardhat test accounts
const ethers = require('ethers');

// Connect to local Hardhat node
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

// Use the first test account (which has 10000 ETH)
const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const wallet = new ethers.Wallet(testPrivateKey, provider);

// Load contract ABI and address from config
const config = require('./config');
const contractAddress = config.CONTRACT_ADDRESS.localhost;
const contractABI = config.ABI;

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function main() {
  try {
    // Get wallet balance
    const balance = await wallet.getBalance();
    console.log(`Test wallet address: ${wallet.address}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    // Get contract info
    const name = await contract.name();
    console.log(`Contract name: ${name}`);
    console.log(`Contract address: ${contractAddress}`);
    
    // Instructions for using the test account in MetaMask
    console.log('\nTo use this test account in MetaMask:');
    console.log('1. Open MetaMask');
    console.log('2. Click on your account icon -> Import Account');
    console.log(`3. Paste this private key: ${testPrivateKey}`);
    console.log('4. Make sure you are connected to the Hardhat Network (http://localhost:8545)');
    
    console.log('\nThis account has plenty of test ETH to mint NFTs.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
