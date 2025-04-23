// Setup NFT Project - Deploy contract, generate ABI, create config.js, set base URI
const fs = require('fs');
const path = require('path');
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Setting up NFT project...");
  
  // 1. Deploy the contract
  console.log("\n1. Deploying contract...");
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy(deployer.address);
  await myNFT.waitForDeployment();
  const contractAddress = await myNFT.getAddress();
  console.log(`Contract deployed to: ${contractAddress}`);
  
  // 2. Update .env file with contract address
  console.log("\n2. Updating .env file...");
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Updated .env file with CONTRACT_ADDRESS=${contractAddress}`);
  
  // 3. Generate config.js with correct ABI
  console.log("\n3. Generating config.js with correct ABI...");
  const abiPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'MyNFT.sol', 'MyNFT.json');
  const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const abi = contractJson.abi;
  
  // Get the Sepolia RPC URL from .env
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";
  
  // Create the config object
  const config = {
    CONTRACT_ADDRESS: contractAddress,
    SEPOLIA_RPC_URL: sepoliaRpcUrl,
    ABI: abi
  };
  
  // Write the config to config.js
  const configContent = `window.CONFIG = ${JSON.stringify(config, null, 2)};`;
  fs.writeFileSync(path.join(__dirname, '..', 'config.js'), configContent);
  console.log(`Generated config.js with correct ABI for contract at ${contractAddress}`);
  
  // 4. Set the base URI for the contract
  console.log("\n4. Setting base URI for contract...");
  const baseURI = "http://localhost:8000/api/nft/";
  const tx = await myNFT.setBaseURI(baseURI);
  await tx.wait();
  console.log(`Base URI set to: ${baseURI}`);
  console.log(`Transaction hash: ${tx.hash}`);
  
  // 5. Mint some NFTs
  console.log("\n5. Minting some NFTs...");
  for (let i = 0; i < 3; i++) {
    const mintTx = await myNFT.mint(deployer.address, { value: hre.ethers.parseEther("0.01") });
    await mintTx.wait();
    console.log(`Minted NFT #${i+1} to ${deployer.address}`);
  }
  
  console.log("\nNFT project setup complete!");
  console.log("\nNext steps:");
  console.log("1. Start the server with: node server.js");
  console.log("2. Access the NFT minting interface at: http://localhost:8000/nft.html");
  console.log("3. Connect your wallet with the account that has these NFTs");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error setting up NFT project:", error);
    process.exit(1);
  });
