import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import useWallet from '../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect, 
    isLoading, 
    error 
  } = useWallet();

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-center">
      {isConnected && address ? (
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm bg-gray-800 text-white px-3 py-1 rounded-full">
            {formatAddress(address)}
          </span>
          <button
            onClick={disconnect}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Disconnect Wallet"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Wallet size={18} />
          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default WalletConnect;