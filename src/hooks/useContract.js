import { useState, useEffect, useCallback } from "react";
import { getContract, getMintPrice, getCurrentSupply, getMaxSupply } from "../utils/contract.js";

const useContract = (signer, provider) => {
  const [state, setState] = useState({
    contract: null,
    mintPrice: "0",
    currentSupply: 0,
    maxSupply: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize contract
  const initContract = useCallback(async () => {
    if (!signer && !provider) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Initialize with signer if available, otherwise use provider
      const contract = await getContract(signer || provider);
      
      // Get contract data
      const mintPrice = await getMintPrice(contract);
      const currentSupply = await getCurrentSupply(contract);
      const maxSupply = await getMaxSupply(contract);
      
      setState({
        contract,
        mintPrice,
        currentSupply,
        maxSupply
      });
    } catch (err) {
      console.error("Failed to initialize contract:", err);
      setError(err.message || "Failed to initialize contract");
    } finally {
      setIsLoading(false);
    }
  }, [signer, provider]);

  // Refresh contract data
  const refreshContractData = useCallback(async () => {
    if (!state.contract) return;
    
    try {
      const mintPrice = await getMintPrice(state.contract);
      const currentSupply = await getCurrentSupply(state.contract);
      const maxSupply = await getMaxSupply(state.contract);
      
      setState(prev => ({
        ...prev,
        mintPrice,
        currentSupply,
        maxSupply
      }));
    } catch (err) {
      console.error("Failed to refresh contract data:", err);
    }
  }, [state.contract]);

  // Initialize contract on mount or when signer/provider changes
  useEffect(() => {
    initContract();
  }, [initContract]);

  return {
    ...state,
    isLoading,
    error,
    refreshContractData
  };
};

export default useContract;
