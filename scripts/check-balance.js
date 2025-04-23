// Check the balance of the account in the .env file
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Get the wallet address from the private key in .env
  const [signer] = await ethers.getSigners();
  
  console.log(`Checking balance for address: ${signer.address}`);
  
  // Get the balance
  const balance = await ethers.provider.getBalance(signer.address);
  
  // Convert to ETH
  const balanceInEth = ethers.formatEther(balance);
  
  console.log(`Balance: ${balanceInEth} ETH`);
  console.log(`Raw balance: ${balance.toString()} wei`);
  
  // Check if there's enough ETH for deployment (rough estimate)
  if (balance < ethers.parseEther("0.01")) {
    console.log("WARNING: You may not have enough ETH to deploy a contract on this network.");
    console.log("Consider getting some testnet ETH from a faucet.");
    console.log("For Sepolia: https://sepoliafaucet.com/ or https://faucet.sepolia.dev/");
  } else {
    console.log("You have enough ETH to deploy a contract.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
