// Static contract data with hardcoded values to avoid any dynamic imports
import { ethers } from "ethers";

// Simplified contract ABI with just the functions we need
export const CONTRACT_ABI = [
  // Read functions
  "function getMintPrice() view returns (uint256)",
  "function getCurrentSupply() view returns (uint256)",
  "function getMaxSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  
  // Write functions
  "function publicMint(string memory tokenURI) payable",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Hardcoded contract addresses for each network
export const CONTRACT_ADDRESSES = {
  // Sepolia testnet (PREFERRED NETWORK)
  11155111: "0xd9145CCE52D386f254917e481eB44e9943F39138",
  
  // Polygon Amoy testnet
  80002: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  
  // Goerli testnet
  5: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  
  // Localhost
  1337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

// Hardcoded deployment data
export const DEPLOYMENT_DATA = {
  // Sepolia testnet
  11155111: {
    contractAddress: "0xd9145CCE52D386f254917e481eB44e9943F39138",
    deploymentBlock: 4270321,
    deploymentTimestamp: "2025-04-21T13:54:00.000Z",
    networkName: "Sepolia"
  },
  
  // Polygon Amoy testnet
  80002: {
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    deploymentBlock: 1000000,
    deploymentTimestamp: "2025-04-21T13:54:00.000Z",
    networkName: "Polygon Amoy"
  }
};

// Helper function to get network configuration
export const getNetworkConfig = async () => {
  try {
    // Get network from the connected provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    console.log(`Current chain ID: 0x${network.chainId.toString(16)}`);
    
    // Get contract address for this network
    const contractAddress = CONTRACT_ADDRESSES[network.chainId];
    
    if (!contractAddress) {
      console.error(`No deployment found for chain ID ${network.chainId}`);
      throw new Error(`This application is only supported on Sepolia (11155111) network. Please switch your wallet to Sepolia network to continue.`);
    }
    
    // Get deployment data for this network
    const deploymentData = DEPLOYMENT_DATA[network.chainId] || {
      contractAddress,
      deploymentBlock: 0,
      deploymentTimestamp: new Date().toISOString(),
      networkName: getNetworkName(network.chainId)
    };
    
    console.log(`Connected to ${deploymentData.networkName} network with chain ID ${network.chainId}`);
    
    return { 
      contractAddress,
      contractAbi: CONTRACT_ABI,
      chainId: network.chainId,
      networkName: deploymentData.networkName,
      deploymentBlock: deploymentData.deploymentBlock,
      deploymentTimestamp: deploymentData.deploymentTimestamp
    };
  } catch (error) {
    console.error("Failed to load contract deployment info:", error);
    throw error;
  }
};

// Helper function to get network name
export const getNetworkName = (chainId) => {
  const networkNames = {
    11155111: 'Sepolia',
    80002: 'Polygon Amoy',
    5: 'Goerli',
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    1337: 'Localhost',
    31337: 'Hardhat'
  };
  
  return networkNames[chainId] || 'Unknown';
};

// Helper function to get contract
export const getContract = async (signerOrProvider) => {
  const config = await getNetworkConfig();
  return new ethers.Contract(
    config.contractAddress,
    config.contractAbi,
    signerOrProvider
  );
};

// Helper function to get mint price
export const getMintPrice = async (contract) => {
  const price = await contract.getMintPrice();
  return ethers.utils.formatEther(price);
};

// Helper function to get current supply
export const getCurrentSupply = async (contract) => {
  return (await contract.getCurrentSupply()).toString();
};

// Helper function to get max supply
export const getMaxSupply = async (contract) => {
  return (await contract.getMaxSupply()).toString();
};
