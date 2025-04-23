const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  it("Should return the correct mint price", async function () {
    const [owner] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy(owner.address);
    expect(await myNFT.getMintPrice()).to.equal(ethers.parseEther("0.01"));
  });

  it("Should mint and assign the NFT to the owner when sent enough ETH", async function () {
    const [owner, user] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy(owner.address);
    await myNFT.connect(user).mint(user.address, { value: ethers.parseEther("0.01") });
    expect(await myNFT.ownerOf(1)).to.equal(user.address);
  });

  it("Should fail to mint if not enough ETH is sent", async function () {
    const [owner, user] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy(owner.address);
    await expect(myNFT.connect(user).mint(user.address, { value: ethers.parseEther("0.001") }))
      .to.be.revertedWith("Insufficient ETH sent");
  });

  it("Owner can withdraw contract balance", async function () {
    const [owner, user] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy(owner.address);
    await myNFT.connect(user).mint(user.address, { value: ethers.parseEther("0.01") });
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const withdrawTx = await myNFT.connect(owner).withdraw();
    await withdrawTx.wait();
    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
