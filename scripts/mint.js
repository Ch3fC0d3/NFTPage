require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const recipient = process.env.RECIPIENT_ADDRESS;
  if (!contractAddress || !recipient) {
    throw new Error("CONTRACT_ADDRESS and RECIPIENT_ADDRESS must be set in .env");
  }
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(contractAddress);
  // Fetch mint price from contract
  const mintPrice = await myNFT.getMintPrice();
  // Send mint transaction with value
  const tx = await myNFT.mint(recipient, { value: mintPrice });
  await tx.wait();
  console.log(`Minted NFT to ${recipient} for ${ethers.formatEther(mintPrice)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
