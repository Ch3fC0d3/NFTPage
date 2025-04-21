import { useState, useEffect, useCallback } from "react";
import { 
  getDirectContract, 
  getDirectMintPrice, 
  getDirectCurrentSupply, 
  getDirectMaxSupply 
} from "../utils/directContract.js";

const useDirectContract = (signer, provider) => {
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
      const contract = await getDirectContract(signer || provider);
      
      // Get contract data
      const mintPrice = await getDirectMintPrice(contract);
      const currentSupply = await getDirectCurrentSupply(contract);
      const maxSupply = await getDirectMaxSupply(contract);
      
      setState({
        contract,
        mintPrice,
        currentSupply,
        maxSupply
      });
    } catch (err) {
      console.error("Failed to initialize direct contract:", err);
      setError(err.message || "Failed to initialize contract");
    } finally {
      setIsLoading(false);
    }
  }, [signer, provider]);

  // Refresh contract data
  const refreshContractData = useCallback(async () => {
    if (!state.contract) return;
    
    try {
      const mintPrice = await getDirectMintPrice(state.contract);
      const currentSupply = await getDirectCurrentSupply(state.contract);
      const maxSupply = await getDirectMaxSupply(state.contract);
      
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

export default useDirectContract;
