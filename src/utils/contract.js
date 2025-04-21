import { ethers } from "ethers";
// Import contract ABI
import contractAbi from "../../artifacts/contracts/CryptoCanvas.sol/CryptoCanvas.json";

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

// Get network configuration based on connected chain
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
    
    // Determine network name based on chain ID
    const networkNames = {
      11155111: 'Sepolia',
      80002: 'Polygon Amoy',
      5: 'Goerli',
      1337: 'Localhost',
      31337: 'Hardhat'
    };
    
    const networkName = networkNames[network.chainId] || 'Unknown';
    console.log(`Connected to ${networkName} network with chain ID ${network.chainId}`);
    
    return { 
      contractAddress,
      contractAbi: contractAbi.abi,
      chainId: network.chainId,
      networkName
    };
  } catch (error) {
    console.error("Failed to load contract deployment info:", error);
    throw error;
  }
};

export const getContract = async (signerOrProvider) => {
  const config = await getNetworkConfig();
  return new ethers.Contract(
    config.contractAddress,
    config.contractAbi,
    signerOrProvider
  );
};

export const getMintPrice = async (contract) => {
  const price = await contract.getMintPrice();
  return ethers.utils.formatEther(price);
};

export const getCurrentSupply = async (contract) => {
  const supply = await contract.getCurrentSupply();
  return supply.toNumber();
};

export const getMaxSupply = async (contract) => {
  const maxSupply = await contract.getMaxSupply();
  return maxSupply.toNumber();
};

// Function to mint a new NFT
export const mintNFT = async (contract, tokenURI) => {
  try {
    // Get the mint price from the contract
    const mintPrice = await contract.getMintPrice();
    console.log('Mint price:', ethers.utils.formatEther(mintPrice), 'ETH');
    
    // The smart contract's publicMint function only takes the URI as a parameter
    // and the value is sent as part of the transaction options
    const tx = await contract.publicMint(tokenURI, { 
      value: mintPrice,
      gasLimit: 250000 // Add a reasonable gas limit to avoid transaction failures
    });
    
    console.log('Mint transaction sent:', tx.hash);
    return tx;
  } catch (error) {
    console.error('Error in mintNFT function:', error);
    throw error; // Re-throw to allow component-level error handling
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
