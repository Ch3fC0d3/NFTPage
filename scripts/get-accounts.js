// Script to get Hardhat test accounts
const hre = require("hardhat");

async function main() {
  console.log("Hardhat Network Test Accounts:");
  console.log("===============================");
  
  const accounts = await hre.ethers.getSigners();
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const balance = await hre.ethers.provider.getBalance(account.address);
    const balanceInEth = hre.ethers.formatEther(balance);
    
    console.log(`Account #${i}: ${account.address}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log("---------------------------------------");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
