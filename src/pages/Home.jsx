import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { Toaster, toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// Hardcoded Sepolia contract data
const SEPOLIA_CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

// Simplified ABI with just the functions we need
const CONTRACT_ABI = [
  // Read functions
  "function getMintPrice() view returns (uint256)",
  "function getCurrentSupply() view returns (uint256)",
  "function getMaxSupply() view returns (uint256)",
  // Write functions
  "function publicMint(string memory tokenURI) payable",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Sample NFT metadata options
const SAMPLE_NFTS = [
  {
    name: "Abstract Waves",
    description: "A beautiful abstract digital painting with flowing waves in blue and purple.",
    image: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Geometric Bloom",
    description: "Geometric patterns forming a blooming flower design.",
    image: "https://images.pexels.com/photos/2693212/pexels-photo-2693212.png?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Cyberpunk City",
    description: "A futuristic cityscape with neon lights and cyberpunk aesthetics.",
    image: "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

function Home() {
  // State variables
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mintPrice, setMintPrice] = useState('0');
  const [currentSupply, setCurrentSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [selectedNft, setSelectedNft] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [transaction, setTransaction] = useState(null);

  // Initialize wallet and contract
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            console.log("Found existing connection:", accounts);
            await connectWallet(false); // Connect without prompting
          }

          // Setup event listeners
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
              // User disconnected
              setIsConnected(false);
              setAddress('');
              setSigner(null);
            } else {
              // Account changed
              connectWallet(false);
            }
          });

          window.ethereum.on('chainChanged', () => {
            window.location.reload(); // Reload on chain change
          });
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
    };

    init();
    return () => {
      // Cleanup listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async (prompt = true) => {
    if (typeof window.ethereum === 'undefined') {
      toast.error("MetaMask not installed! Please install MetaMask to use this app.");
      return;
    }

    try {
      setLoading(true);
      
      // Request accounts
      const method = prompt ? 'eth_requestAccounts' : 'eth_accounts';
      const accounts = await window.ethereum.request({ method });
      
      if (accounts.length === 0) {
        if (prompt) toast.error("No accounts found or user rejected request");
        return;
      }

      // Get network info
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainIdHex, 16);
      setChainId(chainIdNum);

      // Create provider and signer
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      
      // Update state
      setIsConnected(true);
      setAddress(accounts[0]);
      setProvider(ethersProvider);
      setSigner(ethersSigner);

      // Check if on Sepolia
      if (chainIdHex !== SEPOLIA_CHAIN_ID_HEX) {
        setNetworkError("Please switch to Sepolia network to use this application");
      } else {
        setNetworkError(null);
        // Initialize contract
        initializeContract(ethersSigner);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    
    try {
      setLoading(true);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
      });
      
      // Wait a moment for the network to update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // If the network is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          toast.error("Failed to add Sepolia network");
        }
      } else {
        console.error("Error switching to Sepolia:", error);
        toast.error("Failed to switch network");
      }
      setLoading(false);
    }
  };

  // Initialize contract
  const initializeContract = async (signerOrProvider) => {
    try {
      // Create contract instance
      const contractInstance = new ethers.Contract(
        SEPOLIA_CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signerOrProvider
      );
      setContract(contractInstance);

      // Get contract data
      await refreshContractData(contractInstance);
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      toast.error("Failed to initialize contract");
    }
  };

  // Refresh contract data
  const refreshContractData = async (contractInstance) => {
    try {
      const contract = contractInstance || (signer ? new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, CONTRACT_ABI, signer) : null);
      if (!contract) return;

      // Get mint price
      const price = await contract.getMintPrice();
      setMintPrice(ethers.utils.formatEther(price));

      // Get current supply
      const supply = await contract.getCurrentSupply();
      setCurrentSupply(supply.toString());

      // Get max supply
      const max = await contract.getMaxSupply();
      setMaxSupply(max.toString());
    } catch (error) {
      console.error("Failed to refresh contract data:", error);
    }
  };

  // Mint NFT function
  const handleMint = async () => {
    if (!signer || !contract || !isConnected) return;
    
    setIsMinting(true);
    
    try {
      // Get the selected NFT metadata
      const selectedMetadata = SAMPLE_NFTS[selectedNft];
      console.log('Attempting to mint NFT with metadata:', selectedMetadata);
      
      // Get mint price
      const mintPriceWei = await contract.getMintPrice();
      console.log('Mint price:', ethers.utils.formatEther(mintPriceWei), 'ETH');
      
      // Mint NFT with value equal to mint price
      const tx = await contract.publicMint(JSON.stringify(selectedMetadata), { 
        value: mintPriceWei,
        gasLimit: 500000 // Explicit gas limit to avoid estimation issues
      });
      
      console.log('Mint transaction sent:', tx.hash);
      setTransaction(tx.hash);
      
      // Show toast notification
      toast.loading("Minting your NFT...", { id: tx.hash });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      // Update toast notification
      toast.success("NFT minted successfully!", { id: tx.hash });
      
      // Refresh contract data
      refreshContractData();
    } catch (error) {
      console.error("Mint error:", error);
      
      // Provide more specific error messages based on common issues
      if (error.code === 'ACTION_REJECTED') {
        toast.error("Transaction rejected by user");
      } else if (error.message && error.message.includes('insufficient funds')) {
        toast.error("Insufficient funds to complete transaction");
      } else if (error.message && error.message.includes('user rejected')) {
        toast.error("Transaction rejected by user");
      } else if (error.message && error.message.includes('chain ID')) {
        toast.error("Please switch to Sepolia network");
        setNetworkError("This application requires the Sepolia network (Chain ID: 11155111)");
      } else {
        toast.error(`Failed to mint NFT: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Container className="py-5">
      <Toaster position="top-center" />
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 mb-4">NFT Manager <Badge bg="info">Sepolia Network</Badge></h1>
          <p className="lead">
            Welcome to the NFT Manager! This application allows you to mint and manage your NFTs on the Sepolia testnet.
          </p>
        </Col>
      </Row>
      
      {/* Network Error Alert */}
      {networkError && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex align-items-center">
              <div className="me-3">⚠️</div>
              <div>
                <strong>{networkError}</strong>
                <div className="mt-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    disabled={loading}
                    onClick={switchToSepolia}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Switching...
                      </>
                    ) : (
                      "Switch to Sepolia Network"
                    )}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Why CryptoCanvas?</h2>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <FileCode2 size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">ERC-721 Standard</h3>
                  <p className="text-muted">
                    Built on the Ethereum blockchain using the ERC-721 standard for maximum compatibility with marketplaces and wallets.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <Shield size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">Secure Ownership</h3>
                  <p className="text-muted">
                    Your NFT ownership is secured by the Ethereum blockchain, providing immutable proof of authenticity and provenance.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <CreditCard size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">Easy Transactions</h3>
                  <p className="text-muted">
                    Buy, sell, and trade your NFTs with ease using MetaMask or any other Ethereum-compatible wallet.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mint Section */}
      <section id="mint" className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow border-0">
                <Card.Body className="p-4">
                  <h2 className="text-center mb-4 fw-bold">Mint Your NFT</h2>
                  <MintNft />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default Home;
