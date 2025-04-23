import { ethers } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

// Initial wallet state
export const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  signer: null
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && window.ethereum !== undefined;
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<WalletState> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    
    return {
      isConnected: true,
      address: accounts[0],
      chainId: network.chainId,
      provider,
      signer
    };
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

// Listen for account changes
export const addWalletListeners = (callback: (state: Partial<WalletState>) => void): void => {
  if (!isMetaMaskInstalled()) return;

  // Account changed
  window.ethereum.on("accountsChanged", async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      callback({
        isConnected: false,
        address: null,
        signer: null
      });
    } else {
      // Account switched
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      callback({
        isConnected: true,
        address: accounts[0],
        signer: provider.getSigner()
      });
    }
  });

  // Chain changed
  window.ethereum.on("chainChanged", async (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    callback({
      chainId,
      provider,
      signer: provider.getSigner()
    });
  });

  // Disconnect
  window.ethereum.on("disconnect", () => {
    callback({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null
    });
  });
};

// Remove wallet listeners
export const removeWalletListeners = (): void => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
  window.ethereum.removeAllListeners("disconnect");
};

// Switch to a specific network
export const switchNetwork = async (chainId: number): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  const chainIdHex = `0x${chainId.toString(16)}`;
  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (error: any) {
    // This error code indicates the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error("This network is not available in your MetaMask, please add it manually");
    }
    throw error;
  }
};