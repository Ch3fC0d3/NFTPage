// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public mintPrice = 0.01 ether;
    string private _baseTokenURI;

    constructor() 
        ERC721("SimpleNFT", "SNFT") 
        Ownable() 
    {}

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
    function safeMint(address to, string memory uri) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // Owner can withdraw collected funds
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // The following functions are overrides required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
