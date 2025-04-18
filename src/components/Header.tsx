import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Image, Home } from 'lucide-react';
import WalletConnect from './WalletConnect';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Palette className="text-indigo-600 mr-2" size={28} />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CryptoCanvas
          </h1>
        </div>
        
        <nav className="flex items-center space-x-6">
          <div className="flex space-x-2 mr-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-1">
                <Home size={18} />
                <span>Home</span>
              </span>
            </Link>
            
            <Link
              to="/gallery"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/gallery') 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-1">
                <Image size={18} />
                <span>Gallery</span>
              </span>
            </Link>
          </div>
          
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
};

export default Header;