// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SepoliaNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    
    // Token counter
    uint256 private _tokenIds;
    
    // Mint price
    uint256 public mintPrice = 0.01 ether;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    constructor() ERC721("SepoliaNFT", "SNFT") Ownable(msg.sender) {}
    
    // Set the base URI for token metadata
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // Override to return our custom base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Get the mint price
    function getMintPrice() public view returns (uint256) {
        return mintPrice;
    }
    
    // Mint a new NFT
    function mint(address to) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        _tokenIds += 1;
        _mint(to, _tokenIds);
        return _tokenIds;
    }
    
    // Owner can withdraw collected funds
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
