/**
 * Pinata IPFS Integration for NFT Website
 * 
 * This module provides functions to upload NFT images and metadata to IPFS via Pinata.
 */

// Pinata JWT token (will be loaded from the server)
let PINATA_JWT = null;

/**
 * Initialize Pinata integration by fetching the JWT token from the server
 * @returns {Promise<boolean>} True if initialization was successful
 */
async function initPinata() {
  try {
    // Fetch JWT token from the server
    const response = await fetch('/api/pinata/token');
    const data = await response.json();
    
    if (data.jwt) {
      PINATA_JWT = data.jwt;
      console.log('Pinata integration initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize Pinata: No JWT token received');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Pinata:', error);
    return false;
  }
}

/**
 * Upload an image file to IPFS via Pinata
 * @param {File} imageFile - The image file to upload
 * @param {string} name - Name for the file in Pinata
 * @returns {Promise<string|null>} IPFS hash or null if failed
 */
async function uploadImageToIPFS(imageFile, name = null) {
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata not initialized. Call initPinata() first.');
    }
    
    console.log(`Uploading image ${imageFile.name} to IPFS...`);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Add metadata for the file
    const metadata = {
      name: name || `nft-image-${Date.now()}`
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Image uploaded to IPFS with hash: ${result.IpfsHash}`);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    return null;
  }
}

/**
 * Upload NFT metadata to IPFS via Pinata
 * @param {Object} metadata - The metadata to upload
 * @param {string} name - Name for the metadata in Pinata
 * @returns {Promise<string|null>} IPFS hash or null if failed
 */
async function uploadMetadataToIPFS(metadata, name = null) {
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata not initialized. Call initPinata() first.');
    }
    
    console.log(`Uploading metadata for ${metadata.name || 'NFT'} to IPFS...`);
    
    const pinataMetadata = {
      name: name || `nft-metadata-${Date.now()}`
    };
    
    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: pinataMetadata
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata metadata upload failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Metadata uploaded to IPFS with hash: ${result.IpfsHash}`);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    return null;
  }
}

/**
 * Create and upload a complete NFT (image + metadata) to IPFS
 * @param {File} imageFile - The image file to upload
 * @param {Object} nftData - NFT data (name, description, attributes, etc.)
 * @returns {Promise<Object|null>} Object with image and metadata hashes, or null if failed
 */
async function createAndUploadNFT(imageFile, nftData) {
  try {
    // First upload the image
    const imageHash = await uploadImageToIPFS(imageFile, `${nftData.name}-image`);
    
    if (!imageHash) {
      throw new Error('Failed to upload image to IPFS');
    }
    
    // Create metadata with the image IPFS link
    const metadata = {
      name: nftData.name || `NFT ${Date.now()}`,
      description: nftData.description || 'An NFT created with our platform',
      image: `ipfs://${imageHash}`,
      attributes: nftData.attributes || [],
      created_at: new Date().toISOString()
    };
    
    // Upload the metadata
    const metadataHash = await uploadMetadataToIPFS(metadata, `${nftData.name}-metadata`);
    
    if (!metadataHash) {
      throw new Error('Failed to upload metadata to IPFS');
    }
    
    // Return the complete NFT information
    return {
      image: {
        hash: imageHash,
        url: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        ipfsUrl: `ipfs://${imageHash}`
      },
      metadata: {
        hash: metadataHash,
        url: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        ipfsUrl: `ipfs://${metadataHash}`
      },
      tokenURI: `ipfs://${metadataHash}`
    };
  } catch (error) {
    console.error('Error creating and uploading NFT:', error);
    return null;
  }
}

// Export the functions
window.PinataIPFS = {
  init: initPinata,
  uploadImage: uploadImageToIPFS,
  uploadMetadata: uploadMetadataToIPFS,
  createNFT: createAndUploadNFT
};
