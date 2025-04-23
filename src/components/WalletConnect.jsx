import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button, Badge } from 'react-bootstrap';
import useWallet from '../hooks/useWallet';

function WalletConnect() {
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect, 
    isLoading, 
    error 
  } = useWallet();

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="d-flex flex-column align-items-center">
      {isConnected && address ? (
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark" className="py-2 px-3">
            {formatAddress(address)}
          </Badge>
          <Button
            onClick={disconnect}
            variant="danger"
            size="sm"
            className="rounded-circle p-1"
            title="Disconnect Wallet"
          >
            <LogOut size={18} />
          </Button>
        </div>
      ) : (
        <Button
          onClick={connect}
          disabled={isLoading}
          variant="primary"
          className="d-flex align-items-center gap-2"
        >
          <Wallet size={18} />
          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
        </Button>
      )}
      
      {error && (
        <div className="mt-2 alert alert-danger py-2 px-3">
          <small>
            {error.includes('MetaMask') ? (
              <>
                <strong>MetaMask Error:</strong> {error}
                <div className="mt-1">
                  {error.includes('already pending') ? (
                    <small>
                      <strong>Solution:</strong> Open the MetaMask extension and check for pending connection requests.
                      Once approved, try connecting again.
                    </small>
                  ) : error.includes('rejected') ? (
                    <small>
                      <strong>Solution:</strong> You declined the connection request. Click connect again if you want to proceed.
                    </small>
                  ) : (
                    <small>Try refreshing the page or check if MetaMask is unlocked.</small>
                  )}
                </div>
              </>
            ) : (
              error
            )}
          </small>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
