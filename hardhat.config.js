require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    // Sepolia testnet configuration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1500000000, // 1.5 gwei
      gas: 2100000, // Lower gas limit
      timeout: 60000, // Longer timeout (60 seconds)
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // No accounts needed, Hardhat node provides them automatically
    },
    hardhat: {
      // Hardhat network configuration
      chainId: 31337,
    },
  },
};
