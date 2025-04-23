# Minimal ERC-721 NFT (Sepolia)

A simple ERC-721 (NFT) smart contract using OpenZeppelin, Hardhat, and Ethers.js. Deploys to Sepolia testnet and allows minting via script or MetaMask.

## Prerequisites
- Node.js & npm
- [MetaMask](https://metamask.io/) wallet with Sepolia ETH
- Sepolia RPC endpoint (e.g., from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/))

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `SEPOLIA_RPC_URL`: Your Sepolia RPC URL
   - `PRIVATE_KEY`: Your wallet private key (never share this!)

## Deploy to Sepolia
```sh
npm run deploy
```
- Note the deployed contract address.

## Mint an NFT
1. Add to `.env`:
   - `CONTRACT_ADDRESS`: The deployed contract address
   - `RECIPIENT_ADDRESS`: The wallet address to receive the NFT
2. Run:
   ```sh
   npm run mint
   ```

## Test Locally
```sh
npm test
```

## Interact via MetaMask
- Add Sepolia network to MetaMask
- Import your wallet using the private key
- Use the contract ABI (`artifacts/contracts/MyNFT.sol/MyNFT.json`) to interact via [Remix](https://remix.ethereum.org/) or Etherscan

## Security
- Never expose your private key
- Use testnet ETH only

## License
MIT
