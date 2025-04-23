const hre = require("hardhat");

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const [deployer] = await hre.ethers.getSigners();
  const myNFT = await MyNFT.deploy(deployer.address);
  await myNFT.waitForDeployment();
  const address = await myNFT.getAddress();
  console.log("MyNFT deployed to:", address);
  
  // Save the contract address to the .env file
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace or add CONTRACT_ADDRESS
  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${address}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Updated .env file with CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
