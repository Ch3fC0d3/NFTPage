import { ethers } from "ethers";
import type { CryptoCanvas } from "../types/contracts";
// Updated import path to correctly resolve the contract ABI
import contractAbi from "../../artifacts/contracts/CryptoCanvas.sol/CryptoCanvas.json";

// Import ABI and contract addresses
export const getNetworkConfig = async () => {
  // Get network from the connected provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getNetwork()
    .then(async network => {
      try {
        // Try to load deployment info for the current network
        const networkName = network.name !== 'unknown' ? network.name : 'localhost';
        
        // Use dynamic import instead of require
        const deploymentInfo = await import(`../deployments/${networkName}.json`);
        
        return { 
          contractAddress: deploymentInfo.default.contractAddress,
          contractAbi: contractAbi.abi,
          chainId: network.chainId
        };
      } catch (error) {
        console.error("Failed to load contract deployment info:", error);
        throw new Error("Contract not deployed to this network");
      }
    });
};

export const getContract = async (
  signerOrProvider: ethers.Signer | ethers.providers.Provider
): Promise<CryptoCanvas> => {
  const config = await getNetworkConfig();
  return new ethers.Contract(
    config.contractAddress,
    config.contractAbi,
    signerOrProvider
  ) as unknown as CryptoCanvas;
};

export const getMintPrice = async (
  contract: CryptoCanvas
): Promise<string> => {
  const price = await contract.getMintPrice();
  return ethers.utils.formatEther(price);
};

export const getCurrentSupply = async (
  contract: CryptoCanvas
): Promise<number> => {
  const supply = await contract.getCurrentSupply();
  return supply.toNumber();
};

export const getMaxSupply = async (
  contract: CryptoCanvas
): Promise<number> => {
  const maxSupply = await contract.getMaxSupply();
  return maxSupply.toNumber();
};

// Function to mint a new NFT
export const mintNFT = async (
  contract: CryptoCanvas,
  tokenURI: string
): Promise<ethers.ContractTransaction> => {
  const mintPrice = await contract.getMintPrice();
  return contract.publicMint(tokenURI, { value: mintPrice });
};

// Function to get owned tokens
export const getOwnedTokens = async (
  contract: CryptoCanvas,
  owner: string
): Promise<{ id: number; uri: string }[]> => {
  const currentSupply = await getCurrentSupply(contract);
  const ownedTokens = [];

  // This is not efficient for large collections but works for demo
  for (let i = 0; i < currentSupply; i++) {
    try {
      const tokenOwner = await contract.ownerOf(i);
      if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
        const uri = await contract.tokenURI(i);
        ownedTokens.push({ id: i, uri });
      }
    } catch (error) {
      console.error(`Error checking token ${i}:`, error);
    }
  }

  return ownedTokens;
};