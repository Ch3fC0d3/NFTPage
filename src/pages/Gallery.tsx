import React from 'react';
import NftGallery from '../components/NftGallery';

const Gallery: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your NFT Gallery</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View your collection of CryptoCanvas NFTs. Connect your wallet to see your owned tokens.
        </p>
      </div>
      
      <NftGallery />
    </div>
  );
};

export default Gallery;