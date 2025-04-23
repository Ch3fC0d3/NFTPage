import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCode2, Shield, CreditCard } from 'lucide-react';
import MintNft from '../components/MintNft';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Collect Unique Digital Art on the Blockchain
            </h1>
            <p className="text-lg md:text-xl text-indigo-200 mb-8">
              CryptoCanvas is a premium NFT collection featuring unique digital artwork secured by smart contracts on the Ethereum blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/gallery"
                className="px-6 py-3 bg-white text-indigo-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Collection
              </Link>
              <a
                href="#mint"
                className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Mint NFT
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why CryptoCanvas?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileCode2 size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">ERC-721 Standard</h3>
              <p className="text-gray-600">
                Built on the Ethereum blockchain using the ERC-721 standard for maximum compatibility with marketplaces and wallets.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Ownership</h3>
              <p className="text-gray-600">
                Your ownership is permanently recorded on the blockchain, ensuring authenticity and provenance of your digital art.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Low Gas Fees</h3>
              <p className="text-gray-600">
                Our contract is optimized for minimal gas consumption, making it affordable to mint and transfer your NFTs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mint Section */}
      <section id="mint" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mint Your NFT</h2>
          
          <div className="max-w-3xl mx-auto">
            <MintNft />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to explore the collection?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Check out all the unique pieces in our gallery and discover the perfect addition to your digital art collection.
          </p>
          <Link
            to="/gallery"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span>View Gallery</span>
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;