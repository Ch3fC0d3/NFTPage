// Helper script for connecting to Hardhat test accounts
const { ethers } = require('ethers');

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// First Hardhat test account (has 10000 ETH)
const testAccount = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

// Create wallet instance
const wallet = new ethers.Wallet(testAccount.privateKey, provider);

async function main() {
  try {
    // Get wallet balance
    const balance = await provider.getBalance(testAccount.address);
    console.log(`\nTest wallet address: ${testAccount.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Instructions for using the test account in MetaMask
    console.log('\nTo use this test account in MetaMask:');
    console.log('1. Open MetaMask');
    console.log('2. Click on your account icon -> Import Account');
    console.log(`3. Paste this private key: ${testAccount.privateKey}`);
    console.log('4. Make sure you are connected to the Hardhat Network (http://localhost:8545)');
    
    console.log('\nThis account has plenty of test ETH to mint NFTs.');
    console.log('\nIMPORTANT: When connecting to your NFT website, use this test account in MetaMask');
    console.log('to avoid the "insufficient funds" error.\n');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
