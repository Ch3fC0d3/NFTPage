const hre = require("hardhat");

async function main() {
  console.log(`Deploying contracts to ${hre.network.name}...`);
  
  // Deploy SimpleNFT contract
  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const [deployer] = await hre.ethers.getSigners();
  const simpleNFT = await SimpleNFT.deploy();
  await simpleNFT.waitForDeployment();
  const simpleNFTAddress = await simpleNFT.getAddress();
  console.log("SimpleNFT deployed to:", simpleNFTAddress);
  
  // Save the contract address to the .env file
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace or add CONTRACT_ADDRESS
  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${simpleNFTAddress}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${simpleNFTAddress}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Updated .env file with CONTRACT_ADDRESS=${simpleNFTAddress}`);
  
  // Also update the config.js file for the frontend
  try {
    const configPath = path.join(__dirname, '..', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the contract address for the current network
    const networkName = hre.network.name;
    const regex = new RegExp(`"${networkName}":\s*"[^"]*"`);
    configContent = configContent.replace(regex, `"${networkName}": "${simpleNFTAddress}"`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`Updated config.js with the new contract address for ${networkName}`);
  } catch (error) {
    console.warn("Could not update config.js:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
