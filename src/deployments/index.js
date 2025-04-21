// Static deployment data for all networks
// This file consolidates all deployment information to avoid dynamic import issues

import sepoliaData from './sepolia.json';
import goerliData from './goerli.json';
import amoyData from './amoy.json';
import localhostData from './localhost.json';

// Export a mapping of chain IDs to deployment data
export default {
  // Ethereum Mainnet
  1: { 
    contractAddress: null, 
    networkName: 'mainnet' 
  },
  
  // Goerli Testnet
  5: { 
    contractAddress: goerliData.contractAddress,
    deploymentBlock: goerliData.deploymentBlock,
    deploymentTimestamp: goerliData.deploymentTimestamp,
    networkName: 'goerli'
  },
  
  // Sepolia Testnet
  11155111: { 
    contractAddress: sepoliaData.contractAddress,
    deploymentBlock: sepoliaData.deploymentBlock,
    deploymentTimestamp: sepoliaData.deploymentTimestamp,
    networkName: 'sepolia'
  },
  
  // Polygon Amoy Testnet
  80002: { 
    contractAddress: amoyData.contractAddress,
    deploymentBlock: amoyData.deploymentBlock,
    deploymentTimestamp: amoyData.deploymentTimestamp,
    networkName: 'amoy'
  },
  
  // Local development networks
  1337: { 
    contractAddress: localhostData.contractAddress,
    deploymentBlock: localhostData.deploymentBlock,
    deploymentTimestamp: localhostData.deploymentTimestamp,
    networkName: 'localhost'
  },
  
  // Hardhat network
  31337: { 
    contractAddress: localhostData.contractAddress,
    deploymentBlock: localhostData.deploymentBlock,
    deploymentTimestamp: localhostData.deploymentTimestamp,
    networkName: 'localhost'
  }
};
