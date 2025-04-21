import { ethers } from "ethers";

// Simplified contract ABI with just the functions we need
const CONTRACT_ABI = [
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
const CONTRACT_ADDRESSES = {
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

// Hardcoded deployment data to avoid dynamic imports
const DEPLOYMENT_DATA = {
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
    const deploymentInfo = DEPLOYMENT_DATA[network.chainId] || {
      contractAddress,
      deploymentBlock: 0,
      deploymentTimestamp: new Date().toISOString(),
      networkName: getNetworkName(network.chainId)
    };
    
    console.log(`Connected to ${deploymentInfo.networkName} network with chain ID ${network.chainId}`);
    
    return { 
      contractAddress: deploymentInfo.contractAddress,
      contractAbi: CONTRACT_ABI,
      chainId: network.chainId,
      networkName: deploymentInfo.networkName,
      deploymentBlock: deploymentInfo.deploymentBlock,
      deploymentTimestamp: deploymentInfo.deploymentTimestamp
    };
  } catch (error) {
    console.error("Failed to get network config:", error);
    throw error;
  }
};

// Helper function to get network name
const getNetworkName = (chainId) => {
  const networkNames = {
    11155111: 'Sepolia',
    80002: 'Amoy',
    5: 'Goerli',
    1: 'Mainnet',
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

// Function to mint an NFT
export const mintNFT = async (contract, tokenURI) => {
  try {
    // Get mint price
    const mintPriceWei = await contract.getMintPrice();
    console.log('Mint price:', ethers.utils.formatEther(mintPriceWei), 'ETH');
    
    // Mint NFT with value equal to mint price
    const tx = await contract.publicMint(tokenURI, { 
      value: mintPriceWei,
      gasLimit: 500000 // Explicit gas limit to avoid estimation issues
    });
    console.log('Mint transaction sent:', tx.hash);
    return tx;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

// Function to get owned tokens
export const getOwnedTokens = async (contract, owner) => {
  try {
    // Get the balance of the owner
    const balance = await contract.balanceOf(owner);
    const balanceNumber = balance.toNumber();
    
    if (balanceNumber === 0) {
      return [];
    }
    
    // Get all token IDs owned by the address
    const tokenPromises = [];
    for (let i = 0; i < balanceNumber; i++) {
      const tokenIdPromise = contract.tokenOfOwnerByIndex(owner, i)
        .then(async (tokenId) => {
          const uri = await contract.tokenURI(tokenId);
          return {
            id: tokenId.toNumber(),
            uri
          };
        });
      tokenPromises.push(tokenIdPromise);
    }
    
    return Promise.all(tokenPromises);
  } catch (error) {
    console.error("Error getting owned tokens:", error);
    throw error;
  }
};
