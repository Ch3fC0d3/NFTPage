// Deploy script for the SepoliaNFT contract to Sepolia
const hre = require("hardhat");

async function main() {
  console.log(`Deploying SepoliaNFT to Sepolia network...`);
  
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Deploy SepoliaNFT contract
  const SepoliaNFT = await hre.ethers.getContractFactory("SepoliaNFT");
  const sepoliaNFT = await SepoliaNFT.deploy();
  await sepoliaNFT.waitForDeployment();
  const sepoliaNFTAddress = await sepoliaNFT.getAddress();
  
  console.log(`SepoliaNFT deployed to: ${sepoliaNFTAddress}`);
  
  // Update config.js with the new contract address
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '..', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the contract address for sepolia
    const sepoliaRegex = /"sepolia":\s*"[^"]*"/;
    configContent = configContent.replace(sepoliaRegex, `"sepolia": "${sepoliaNFTAddress}"`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`Updated config.js with the new contract address for Sepolia: ${sepoliaNFTAddress}`);
  } catch (error) {
    console.warn("Could not update config.js:", error.message);
  }
  
  // Update .env file with the contract address
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace or add CONTRACT_ADDRESS
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${sepoliaNFTAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${sepoliaNFTAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env file with CONTRACT_ADDRESS=${sepoliaNFTAddress}`);
  } catch (error) {
    console.warn("Could not update .env file:", error.message);
  }
  
  console.log("\nTo verify the contract on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${sepoliaNFTAddress}`);
  
  console.log("\nImportant: Wait a few minutes for the contract to be fully deployed before interacting with it.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
