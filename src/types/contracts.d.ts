import { ethers } from "ethers";

export interface CryptoCanvas extends ethers.Contract {
  // View Functions
  getMintPrice(): Promise<ethers.BigNumber>;
  getMaxSupply(): Promise<ethers.BigNumber>;
  getCurrentSupply(): Promise<ethers.BigNumber>;
  ownerOf(tokenId: number): Promise<string>;
  tokenURI(tokenId: number): Promise<string>;
  
  // Write Functions
  safeMint(to: string, uri: string, overrides?: ethers.PayableOverrides): Promise<ethers.ContractTransaction>;
  publicMint(uri: string, overrides?: ethers.PayableOverrides): Promise<ethers.ContractTransaction>;
  setMaxSupply(newMaxSupply: ethers.BigNumberish): Promise<ethers.ContractTransaction>;
  setMintPrice(newMintPrice: ethers.BigNumberish): Promise<ethers.ContractTransaction>;
  withdraw(): Promise<ethers.ContractTransaction>;
}