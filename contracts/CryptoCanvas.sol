// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CryptoCanvas
 * @dev ERC721 token with minting capability controlled by roles
 */
contract CryptoCanvas is ERC721, ERC721URIStorage, AccessControl {
    // Using a simple counter instead of the Counters library
    uint256 private _tokenIdCounter;
    uint256 private _maxTokenSupply;
    uint256 private _mintPrice;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MaxSupplyChanged(uint256 newMaxSupply);
    event MintPriceChanged(uint256 newMintPrice);

    error MintPriceNotPaid();
    error MaxSupplyReached();
    error NonExistentToken();
    error WithdrawFailed();

    constructor(
        string memory name,
        string memory symbol,
        uint256 maxTokenSupply,
        uint256 mintPrice
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _maxTokenSupply = maxTokenSupply;
        _mintPrice = mintPrice;
    }

    /**
     * @dev Mint a new token
     * @param to Address receiving the NFT
     * @param uri Token metadata URI
     */
    function safeMint(address to, string memory uri) public payable onlyRole(MINTER_ROLE) {
        if (_tokenIdCounter >= _maxTokenSupply) {
            revert MaxSupplyReached();
        }
        
        if (msg.value < _mintPrice) {
            revert MintPriceNotPaid();
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit TokenMinted(to, tokenId, uri);
    }

    /**
     * @dev Public mint function for users
     * @param uri Token metadata URI
     */
    function publicMint(string memory uri) external payable {
        if (_tokenIdCounter >= _maxTokenSupply) {
            revert MaxSupplyReached();
        }
        
        if (msg.value < _mintPrice) {
            revert MintPriceNotPaid();
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        emit TokenMinted(msg.sender, tokenId, uri);
    }

    /**
     * @dev Set a new max supply (only ADMIN_ROLE)
     * @param newMaxSupply The new maximum token supply
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyRole(ADMIN_ROLE) {
        _maxTokenSupply = newMaxSupply;
        emit MaxSupplyChanged(newMaxSupply);
    }

    /**
     * @dev Set a new mint price (only ADMIN_ROLE)
     * @param newMintPrice The new price to mint a token
     */
    function setMintPrice(uint256 newMintPrice) external onlyRole(ADMIN_ROLE) {
        _mintPrice = newMintPrice;
        emit MintPriceChanged(newMintPrice);
    }

    /**
     * @dev Get the current price to mint a token
     */
    function getMintPrice() external view returns (uint256) {
        return _mintPrice;
    }

    /**
     * @dev Get the maximum token supply
     */
    function getMaxSupply() external view returns (uint256) {
        return _maxTokenSupply;
    }

    /**
     * @dev Get the current token supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Withdraw contract balance (only DEFAULT_ADMIN_ROLE)
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    // The following functions are overrides required by Solidity

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert NonExistentToken();
        }
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}