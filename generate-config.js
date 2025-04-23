// Generates config.js for the HTML frontend using .env
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const contractAddress = process.env.CONTRACT_ADDRESS || "0xYourContractAddressHere";
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";

// Read ABI from build artifact (should include getMintPrice and payable mint)
let abi = [];
try {
  const artifact = require(path.join(__dirname, 'artifacts', 'contracts', 'MyNFT.sol', 'MyNFT.json'));
  abi = artifact.abi;
} catch (e) {
  console.warn('Could not load ABI from artifacts. ABI will be empty.');
}

const configObj = {
  CONTRACT_ADDRESS: contractAddress,
  SEPOLIA_RPC_URL: sepoliaRpcUrl,
  ABI: abi
};

fs.writeFileSync(
  path.join(__dirname, 'config.js'),
  `window.CONFIG = ${JSON.stringify(configObj, null, 2)};\n`
);

console.log('config.js generated with:', configObj);
