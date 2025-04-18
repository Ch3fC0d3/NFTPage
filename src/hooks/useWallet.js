import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { 
  initialWalletState, 
  connectWallet, 
  addWalletListeners, 
  removeWalletListeners,
  isMetaMaskInstalled,
  switchNetwork
} from "../utils/wallet.js";

// Key for storing wallet connection state
const WALLET_STATE_KEY = 'nft_manager_wallet_connected';

const useWallet = () => {
  const [walletState, setWalletState] = useState(initialWalletState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newState = await connectWallet();
      setWalletState(newState);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet (for UI purposes - doesn't actually disconnect MetaMask)
  const disconnect = useCallback(() => {
    setWalletState(initialWalletState);
  }, []);

  // Change network
  const changeNetwork = useCallback(async (chainId) => {
    setIsLoading(true);
    setError(null);

    try {
      await switchNetwork(chainId);
      // The chainChanged event will handle updating the state
    } catch (err) {
      setError(err.message || "Failed to switch network");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing connections when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      // If MetaMask isn't installed, we can't do anything
      if (!isMetaMaskInstalled()) return;
      
      try {
        // Check if we already have a connection
        const accounts = await window.ethereum.request({
          method: "eth_accounts"
        });
        
        console.log("Checking for existing connection:", accounts);
        
        // If we have accounts, we're connected
        if (accounts && accounts.length > 0) {
          console.log("Found existing connection, initializing wallet state");
          setIsLoading(true);
          
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const network = await provider.getNetwork();
            
            setWalletState({
              isConnected: true,
              address: accounts[0],
              chainId: network.chainId,
              provider,
              signer
            });
          } catch (err) {
            console.error("Error initializing existing wallet connection:", err);
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking existing wallet connection:", error);
      }
    };
    
    checkConnection();
  }, []);
  
  // Setup wallet event listeners
  useEffect(() => {
    const handleWalletEvents = (newState) => {
      console.log("Wallet event occurred, updating state:", newState);
      setWalletState(prevState => ({
        ...prevState,
        ...newState
      }));
    };

    addWalletListeners(handleWalletEvents);

    return () => {
      removeWalletListeners();
    };
  }, []);

  return {
    ...walletState,
    isLoading,
    error,
    connect,
    disconnect,
    changeNetwork
  };
};

export default useWallet;
