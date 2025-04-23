// Script to get Hardhat test accounts with private keys
const { ethers } = require("hardhat");

// Hardhat's default accounts and private keys
const accounts = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  }
];

async function main() {
  console.log("Hardhat Network Test Accounts (with Private Keys):");
  console.log("=================================================");
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const balance = await ethers.provider.getBalance(account.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`Account #${i}: ${account.address}`);
    console.log(`Private Key: ${account.privateKey}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log("---------------------------------------");
  }
  
  console.log("\nIMPORTANT: Import one of these accounts into MetaMask to have ETH for transactions.");
  console.log("SECURITY NOTE: These are publicly known keys. Only use for local testing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
