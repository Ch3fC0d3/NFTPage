interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isConnected: () => boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, listener: (...args: any[]) => void) => void;
    removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
    removeAllListeners: (eventName: string) => void;
  };
}