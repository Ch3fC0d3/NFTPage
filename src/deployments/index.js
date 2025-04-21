// Static deployment data for all networks
// This file consolidates all deployment information to avoid dynamic import issues

import sepoliaData from './sepolia.json';

export const getDeploymentData = async (chainId) => {
  // Only return Sepolia deployment data
  if (chainId === 11155111) {
    return sepoliaData;
  }
  
  // For other networks, throw a clear error
  throw new Error(`This application is only supported on Sepolia (11155111) network. Please switch your wallet to Sepolia network to continue.`);
};
