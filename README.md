# NFT Manager

A full-featured NFT management application with smart contract deployment, minting, and a web interface. Built with Hardhat, Ethers.js, Express, and OpenZeppelin.

## Features

- ERC-721 NFT smart contract with minting functionality
- Web interface for minting and viewing NFTs
- Dynamic NFT metadata generation
- Support for both local Hardhat network and Sepolia testnet
- Automatic image generation for NFTs
- RESTful API for NFT metadata
- Seamless MetaMask wallet integration with network detection and switching
- Responsive UI with Bootstrap

## Tech Stack

- **Frontend**: HTML, JavaScript, Bootstrap
- **Backend**: Express.js, Node.js
- **Blockchain**: Ethereum, ethers.js, Hardhat
- **Contract Standard**: ERC-721 (NFT) with OpenZeppelin

## Prerequisites

- Node.js & npm
- [MetaMask](https://metamask.io/) wallet
- Sepolia testnet ETH (for testnet deployment)

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Ch3fC0d3/NFTManager.git
   cd NFTManager
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure your environment:
   - Copy `.env.example` to `.env` (if it doesn't exist)
   - Update the following values in `.env`:
     - `SEPOLIA_RPC_URL`: Your Sepolia RPC URL
     - `PRIVATE_KEY`: Your wallet private key (never share this!)
     - `RECIPIENT_ADDRESS`: The wallet address to receive minted NFTs

## Running Locally

1. Start a local Hardhat node:
   ```sh
   npx hardhat node
   ```

2. In a new terminal, deploy the contract to the local network:
   ```sh
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Set the base URI for your NFTs:
   ```sh
   npx hardhat run scripts/set-base-uri.js --network localhost
   ```

4. Start the web server:
   ```sh
   node server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Deploying to Sepolia Testnet

1. Make sure you have Sepolia ETH in your wallet

2. Deploy the contract:
   ```sh
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. Set the base URI (update with your server URL if needed):
   ```sh
   npx hardhat run scripts/set-base-uri.js --network sepolia
   ```

## Web Interface

The web interface allows you to:
- Connect your MetaMask wallet
- Switch between local and Sepolia networks
- Mint new NFTs
- View your NFT collection
- See metadata and images for your NFTs

## Project Structure

- `contracts/`: Smart contract code
- `scripts/`: Deployment and interaction scripts
- `public/`: Static assets and NFT metadata/images
- `server.js`: Express server for the web interface and metadata API
- `nft.html`: Main web interface
- `config.js`: Configuration for the web interface

## Contract Deployments

- **Localhost**: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- **Sepolia Testnet**: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Test Locally
```sh
npm test
```

## Interact via MetaMask
- Add Sepolia network to MetaMask
- Import your wallet using the private key
- Use the contract ABI (`artifacts/contracts/SepoliaNFT.sol/SepoliaNFT.json`) to interact via [Remix](https://remix.ethereum.org/) or Etherscan

## Security
- Never expose your private key
- Use testnet ETH only

## License

MIT
