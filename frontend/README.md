# NFTMan Frontend

A beautiful Next.js-based frontend for your Sepolia ERC-721 NFT contract. Connect your wallet, view, and mint NFTs with a modern, mobile-friendly UI.

## Features
- Wallet connect (MetaMask, WalletConnect, Coinbase Wallet)
- Mint NFT button with transaction feedback
- Display owned NFTs
- Responsive, modern design (Chakra UI + RainbowKit)

## Quick Start
```sh
cd frontend
npm install
npm run dev
```

- Set your contract address in `src/constants.ts`
- Make sure your backend contract is deployed and you have Sepolia ETH

## Customize
- Update theme in `theme.ts`
- Edit main UI in `pages/index.tsx`

## Security
- Never expose your private key or sensitive data in the frontend.

---
MIT License
