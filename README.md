# NFT Manager

A robust, user-friendly web application for minting and managing NFTs using React, JavaScript, and blockchain technologies.

## Features

- **Wallet Connection**: Seamless MetaMask wallet integration with network detection and switching
- **NFT Minting**: Mint new NFTs directly through the web interface
- **Multi-Network Support**: Compatible with Localhost (development) and Goerli testnet
- **Responsive UI**: Clean, modern interface built with Bootstrap

## Tech Stack

- **Frontend**: React, JavaScript, Bootstrap
- **Blockchain**: Ethereum, ethers.js
- **Contract Standard**: ERC-721 (NFT)
- **Local Development**: Hardhat

## Getting Started

### Prerequisites

- Node.js
- MetaMask browser extension
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ch3fC0d3/NFTManager.git
   cd NFTManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start a local Hardhat blockchain:
   ```bash
   npx hardhat node
   ```

4. Deploy the smart contract to the local blockchain:
   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
   ```

5. Start the frontend application:
   ```bash
   npm run dev
   ```

6. Configure MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8765
   - Chain ID: 1337
   - Currency Symbol: ETH

## Contract Deployments

- **Localhost**: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **Goerli Testnet**: 0xd9145CCE52D386f254917e481eB44e9943F39138

## License

MIT
