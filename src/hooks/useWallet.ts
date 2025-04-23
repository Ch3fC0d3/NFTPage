import { useState, useEffect, useCallback } from "react";
import { 
  WalletState, 
  initialWalletState, 
  connectWallet, 
  addWalletListeners, 
  removeWalletListeners,
  isMetaMaskInstalled,
  switchNetwork
} from "../utils/wallet";

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
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
  const changeNetwork = useCallback(async (chainId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await switchNetwork(chainId);
      // The chainChanged event will handle updating the state
    } catch (err: any) {
      setError(err.message || "Failed to switch network");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update wallet state on change
  const handleWalletChange = useCallback((newState: Partial<WalletState>) => {
    setWalletState(prevState => ({ ...prevState, ...newState }));
  }, []);

  // Set up listeners on mount, remove on unmount
  useEffect(() => {
    addWalletListeners(handleWalletChange);
    
    // Try to connect if MetaMask is already connected
    if (isMetaMaskInstalled() && window.ethereum.isConnected()) {
      connect();
    }
    
    return () => {
      removeWalletListeners();
    };
  }, [connect, handleWalletChange]);

  return {
    ...walletState,
    connect,
    disconnect,
    changeNetwork,
    isLoading,
    error
  };
};

export default useWallet;