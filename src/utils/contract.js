import { ethers } from "ethers";
// Import contract ABI
import contractAbi from "../../artifacts/contracts/CryptoCanvas.sol/CryptoCanvas.json";
// Import all deployment files statically to avoid dynamic import issues in production
import localhostDeployment from '../deployments/localhost.json';
import goerliDeployment from '../deployments/goerli.json';
import sepoliaDeployment from '../deployments/sepolia.json';
import amoyDeployment from '../deployments/amoy.json';
// Optional: import other network deployments if available
// import mumbaiDeployment from '../deployments/mumbai.json';
// import mainnetDeployment from '../deployments/mainnet.json';

// Create a mapping of chain IDs to deployment info
const deploymentsByChainId = {
  1: { deployment: null, name: 'mainnet' }, // Ethereum Mainnet
  5: { deployment: goerliDeployment, name: 'goerli' }, // Goerli Testnet
  11155111: { deployment: sepoliaDeployment, name: 'sepolia' }, // Sepolia Testnet
  80002: { deployment: amoyDeployment, name: 'amoy' }, // Polygon Amoy Testnet
  1337: { deployment: localhostDeployment, name: 'localhost' }, // Local development
  31337: { deployment: localhostDeployment, name: 'localhost' }, // Hardhat network
  // Add other networks as needed
  // 80001: { deployment: mumbaiDeployment, name: 'mumbai' }, // Polygon Mumbai Testnet
};

// Get network configuration based on connected chain
export const getNetworkConfig = async () => {
  // Get network from the connected provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getNetwork()
    .then(network => {
      try {
        // Get deployment info for the current chain ID
        const deploymentInfo = deploymentsByChainId[network.chainId];
        
        if (!deploymentInfo || !deploymentInfo.deployment) {
          console.error(`No deployment found for chain ID ${network.chainId}`);
          throw new Error(`Contract not deployed to network with chain ID ${network.chainId}`);
        }
        
        console.log(`Connected to ${deploymentInfo.name} network with chain ID ${network.chainId}`);
        
        return { 
          contractAddress: deploymentInfo.deployment.contractAddress,
          contractAbi: contractAbi.abi,
          chainId: network.chainId,
          networkName: deploymentInfo.name
        };
      } catch (error) {
        console.error("Failed to load contract deployment info:", error);
        throw new Error(`Contract not deployed to network with chain ID ${network.chainId}`);
      }
    });
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
