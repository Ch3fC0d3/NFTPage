// Deploy script for the CompatibleNFT contract
const hre = require("hardhat");

async function main() {
  console.log(`Deploying CompatibleNFT to ${hre.network.name}...`);
  
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Deploy CompatibleNFT contract
  const CompatibleNFT = await hre.ethers.getContractFactory("CompatibleNFT");
  const compatibleNFT = await CompatibleNFT.deploy(deployer.address);
  await compatibleNFT.waitForDeployment();
  const compatibleNFTAddress = await compatibleNFT.getAddress();
  
  console.log(`CompatibleNFT deployed to: ${compatibleNFTAddress}`);
  
  // Update config.js with the new contract address
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '..', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the contract address for localhost
    const localhostRegex = /"localhost":\s*"[^"]*"/;
    configContent = configContent.replace(localhostRegex, `"localhost": "${compatibleNFTAddress}"`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`Updated config.js with the new contract address for localhost: ${compatibleNFTAddress}`);
  } catch (error) {
    console.warn("Could not update config.js:", error.message);
  }
  
  console.log("\nTo fix the contract mismatch issue:");
  console.log("1. Restart your web server");
  console.log("2. Refresh your browser");
  console.log("3. Connect your wallet again");
  console.log("4. The contract functions should now work correctly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
