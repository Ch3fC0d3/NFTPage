// Generate a new config.js file with the updated ABI
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  // Get the contract address from .env
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS must be set in .env");
  }

  // Get the Sepolia RPC URL from .env
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";

  // Path to the compiled contract ABI
  const abiPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'MyNFT.sol', 'MyNFT.json');
  
  // Read the ABI from the compiled contract
  const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const abi = contractJson.abi;
  
  // Create the config object
  const config = {
    CONTRACT_ADDRESS: contractAddress,
    SEPOLIA_RPC_URL: sepoliaRpcUrl,
    ABI: abi
  };
  
  // Write the config to config.js
  const configContent = `window.CONFIG = ${JSON.stringify(config, null, 2)};`;
  fs.writeFileSync(path.join(__dirname, '..', 'config.js'), configContent);
  
  console.log(`Generated new config.js with updated ABI for contract at ${contractAddress}`);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error generating config:", error);
    process.exit(1);
  });
