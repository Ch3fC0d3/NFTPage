// Set the baseURI for the NFT contract on Sepolia
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from .env
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS must be set in .env");
  }

  // Define the base URI - this should point to a public server for Sepolia deployment
  // For testing, you can use a service like Netlify, Vercel, or a public server
  // Replace this URL with your actual public server URL
  const baseURI = "https://your-public-server.com/api/nft/";
  
  console.log(`Setting base URI to: ${baseURI}`);
  console.log(`For contract: ${contractAddress}`);
  console.log(`On network: Sepolia`);

  // Get the contract factory and attach to the deployed contract
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(contractAddress);

  // Set the base URI
  const tx = await myNFT.setBaseURI(baseURI);
  await tx.wait();
  console.log(`Base URI set successfully! Transaction hash: ${tx.hash}`);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error setting base URI:", error);
    process.exit(1);
  });
