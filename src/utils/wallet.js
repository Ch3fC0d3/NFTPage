import { ethers } from "ethers";

// Initial wallet state
export const initialWalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  signer: null
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && window.ethereum !== undefined;
};

// Global state to track connection status
let isConnecting = false;
let connectionPromise = null;

// Store wallet connection state in localStorage for persistence
const WALLET_STATE_KEY = 'nft_manager_wallet_connected';

/**
 * Connect to MetaMask wallet with debouncing and caching
 * This prevents multiple simultaneous connection attempts
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  console.log("Attempting to connect to wallet...");
  
  // First, check if we're already connected
  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts"
    });
    
    console.log("Current accounts:", accounts);
    
    if (accounts && accounts.length > 0) {
      console.log("Already connected to account:", accounts[0]);
      // We're already connected, just return the connection info
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      // Store connection state
      localStorage.setItem(WALLET_STATE_KEY, 'true');
      
      return {
        isConnected: true,
        address: accounts[0],
        chainId: network.chainId,
        provider,
        signer
      };
    }
  } catch (error) {
    console.error("Error checking existing connection:", error);
  }
  
  // If we're already in the process of connecting, return the existing promise
  if (isConnecting && connectionPromise) {
    console.log("Connection already in progress, waiting...");
    return connectionPromise;
  }
  
  // Mark that we're connecting
  console.log("Starting new connection attempt...");
  isConnecting = true;
  
  // Create a new connection promise
  connectionPromise = new Promise(async (resolve, reject) => {
    // Add a timeout to prevent hanging connections
    const timeoutId = setTimeout(() => {
      isConnecting = false;
      connectionPromise = null;
      reject(new Error("Connection request timed out. Please try again."));
    }, 30000); // 30 second timeout
    
    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      
      console.log("Accounts received:", accounts);
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Reset connection state
      isConnecting = false;
      
      // Save connection state to localStorage
      localStorage.setItem(WALLET_STATE_KEY, 'true');
      
      console.log('Wallet connected successfully:', accounts[0]);
      
      // Return the connection info
      resolve({
        isConnected: true,
        address: accounts[0],
        chainId: network.chainId,
        provider,
        signer
      });
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Reset connection state
      isConnecting = false;
      connectionPromise = null;
      
      // Remove connection state from localStorage
      localStorage.removeItem(WALLET_STATE_KEY);
      
      console.error("Error connecting to wallet:", error);
      reject(error);
    }
  });
  
  return connectionPromise;
};

// Listen for account changes
export const addWalletListeners = (callback) => {
  if (typeof window === "undefined" || !window.ethereum) return;

  // Account changed
  const handleAccountsChanged = (accounts) => {
    console.log("Accounts changed:", accounts);
    
    if (accounts.length === 0) {
      // Disconnected
      localStorage.removeItem(WALLET_STATE_KEY);
      console.log("Wallet disconnected");
      
      callback({
        isConnected: false,
        address: null,
        chainId: null,
        provider: null,
        signer: null
      });
    } else {
      // Account changed, update connection
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      provider.getNetwork().then(network => {
        // Update localStorage
        localStorage.setItem(WALLET_STATE_KEY, 'true');
        
        console.log("Wallet changed to:", accounts[0]);
        
        callback({
          isConnected: true,
          address: accounts[0],
          chainId: network.chainId,
          provider,
          signer
        });
      });
    }
  };
  
  // Chain changed
  const handleChainChanged = (chainId) => {
    console.log("Chain changed to:", chainId);
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload();
  };
  
  // Disconnect
  const handleDisconnect = () => {
    console.log("Wallet disconnect event received");
    localStorage.removeItem(WALLET_STATE_KEY);
    
    callback({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null
    });
  };

  // Add listeners
  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);
  window.ethereum.on("disconnect", handleDisconnect);
  
  console.log("Wallet listeners added");
};

// Remove wallet listeners
export const removeWalletListeners = () => {
  if (typeof window === "undefined" || !window.ethereum) return;
  
  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
  window.ethereum.removeAllListeners("disconnect");
};

// Switch to specified network
export const switchNetwork = async (chainId) => {
  if (!isMetaMaskInstalled()) throw new Error("MetaMask is not installed");
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error("This network needs to be added to your MetaMask");
    }
    throw error;
  }
};
