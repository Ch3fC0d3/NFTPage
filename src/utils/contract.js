import { ethers } from "ethers";
// Import contract ABI
import contractAbi from "../../artifacts/contracts/CryptoCanvas.sol/CryptoCanvas.json";
// Import consolidated deployment data
import deploymentData from '../deployments/index.js';

// Get network configuration based on connected chain
export const getNetworkConfig = async () => {
  try {
    // Get network from the connected provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    console.log(`Current chain ID: 0x${network.chainId.toString(16)}`);
    
    // Get deployment info for the current chain ID
    const deploymentInfo = deploymentData[network.chainId];
    
    if (!deploymentInfo || !deploymentInfo.contractAddress) {
      console.error(`No deployment found for chain ID ${network.chainId}`);
      throw new Error(`Contract not deployed to network with chain ID ${network.chainId}`);
    }
    
    console.log(`Connected to ${deploymentInfo.networkName} network with chain ID ${network.chainId}`);
    
    return { 
      contractAddress: deploymentInfo.contractAddress,
      contractAbi: contractAbi.abi,
      chainId: network.chainId,
      networkName: deploymentInfo.networkName
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
