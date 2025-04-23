const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoCanvas", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployFixture() {
    const [owner, minter, user] = await ethers.getSigners();
    
    // Deploy contract with initial configuration
    const CryptoCanvas = await ethers.getContractFactory("CryptoCanvas");
    const cryptoCanvas = await CryptoCanvas.deploy(
      "CryptoCanvas", 
      "CCAN", 
      1000, // maxSupply
      ethers.utils.parseEther("0.05") // mintPrice (0.05 ETH)
    );
    await cryptoCanvas.deployed();
    
    // Give minter role to the minter account
    const MINTER_ROLE = await cryptoCanvas.MINTER_ROLE();
    await cryptoCanvas.grantRole(MINTER_ROLE, minter.address);
    
    return { cryptoCanvas, owner, minter, user };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { cryptoCanvas } = await loadFixture(deployFixture);
      
      expect(await cryptoCanvas.name()).to.equal("CryptoCanvas");
      expect(await cryptoCanvas.symbol()).to.equal("CCAN");
    });

    it("Should set the right max supply", async function () {
      const { cryptoCanvas } = await loadFixture(deployFixture);
      
      expect(await cryptoCanvas.getMaxSupply()).to.equal(1000);
    });

    it("Should set the right mint price", async function () {
      const { cryptoCanvas } = await loadFixture(deployFixture);
      
      expect(await cryptoCanvas.getMintPrice()).to.equal(ethers.utils.parseEther("0.05"));
    });

    it("Should assign roles correctly", async function () {
      const { cryptoCanvas, owner, minter } = await loadFixture(deployFixture);
      
      const DEFAULT_ADMIN_ROLE = await ethers.constants.HashZero;
      const MINTER_ROLE = await cryptoCanvas.MINTER_ROLE();
      const ADMIN_ROLE = await cryptoCanvas.ADMIN_ROLE();
      
      expect(await cryptoCanvas.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await cryptoCanvas.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await cryptoCanvas.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await cryptoCanvas.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { cryptoCanvas, minter, user } = await loadFixture(deployFixture);
      
      const mintPrice = await cryptoCanvas.getMintPrice();
      const tokenURI = "ipfs://QmSomeHashHere";
      
      await expect(
        cryptoCanvas.connect(minter).safeMint(user.address, tokenURI, { value: mintPrice })
      ).to.emit(cryptoCanvas, "TokenMinted")
        .withArgs(user.address, 0, tokenURI);
      
      expect(await cryptoCanvas.ownerOf(0)).to.equal(user.address);
      expect(await cryptoCanvas.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should allow public to mint tokens with correct payment", async function () {
      const { cryptoCanvas, user } = await loadFixture(deployFixture);
      
      const mintPrice = await cryptoCanvas.getMintPrice();
      const tokenURI = "ipfs://QmAnotherHashHere";
      
      await expect(
        cryptoCanvas.connect(user).publicMint(tokenURI, { value: mintPrice })
      ).to.emit(cryptoCanvas, "TokenMinted")
        .withArgs(user.address, 0, tokenURI);
      
      expect(await cryptoCanvas.ownerOf(0)).to.equal(user.address);
      expect(await cryptoCanvas.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should revert if payment is insufficient", async function () {
      const { cryptoCanvas, user } = await loadFixture(deployFixture);
      
      const mintPrice = await cryptoCanvas.getMintPrice();
      const tokenURI = "ipfs://QmHashHere";
      const insufficientPayment = mintPrice.sub(1);
      
      await expect(
        cryptoCanvas.connect(user).publicMint(tokenURI, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(cryptoCanvas, "MintPriceNotPaid");
    });

    it("Should track token supply correctly", async function () {
      const { cryptoCanvas, user } = await loadFixture(deployFixture);
      
      const mintPrice = await cryptoCanvas.getMintPrice();
      const initialSupply = await cryptoCanvas.getCurrentSupply();
      
      expect(initialSupply).to.equal(0);
      
      // Mint 3 tokens
      for (let i = 0; i < 3; i++) {
        await cryptoCanvas.connect(user).publicMint(`token-${i}`, { value: mintPrice });
      }
      
      const newSupply = await cryptoCanvas.getCurrentSupply();
      expect(newSupply).to.equal(3);
    });
  });

  describe("Admin functions", function () {
    it("Should allow admin to change max supply", async function () {
      const { cryptoCanvas, owner } = await loadFixture(deployFixture);
      
      const newMaxSupply = 2000;
      
      await expect(cryptoCanvas.connect(owner).setMaxSupply(newMaxSupply))
        .to.emit(cryptoCanvas, "MaxSupplyChanged")
        .withArgs(newMaxSupply);
      
      expect(await cryptoCanvas.getMaxSupply()).to.equal(newMaxSupply);
    });

    it("Should allow admin to change mint price", async function () {
      const { cryptoCanvas, owner } = await loadFixture(deployFixture);
      
      const newMintPrice = ethers.utils.parseEther("0.1");
      
      await expect(cryptoCanvas.connect(owner).setMintPrice(newMintPrice))
        .to.emit(cryptoCanvas, "MintPriceChanged")
        .withArgs(newMintPrice);
      
      expect(await cryptoCanvas.getMintPrice()).to.equal(newMintPrice);
    });

    it("Should allow admin to withdraw funds", async function () {
      const { cryptoCanvas, owner, user } = await loadFixture(deployFixture);
      
      const mintPrice = await cryptoCanvas.getMintPrice();
      
      // Mint a token to add funds to the contract
      await cryptoCanvas.connect(user).publicMint("token-uri", { value: mintPrice });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Withdraw funds
      await cryptoCanvas.connect(owner).withdraw();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      // Account for gas costs, the balance should be higher
      expect(finalBalance.gt(initialBalance)).to.be.true;
    });

    it("Should revert when non-admin calls admin functions", async function () {
      const { cryptoCanvas, user } = await loadFixture(deployFixture);
      
      const ADMIN_ROLE = await cryptoCanvas.ADMIN_ROLE();
      
      await expect(
        cryptoCanvas.connect(user).setMaxSupply(2000)
      ).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`
      );
      
      await expect(
        cryptoCanvas.connect(user).setMintPrice(ethers.utils.parseEther("0.1"))
      ).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`
      );
    });
  });
});