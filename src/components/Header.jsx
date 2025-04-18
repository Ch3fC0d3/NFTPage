import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Image, Home } from 'lucide-react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import WalletConnect from './WalletConnect';

function Header() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Palette className="text-primary me-2" size={28} />
          <span className="fw-bold fs-4 text-primary">CryptoCanvas</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              <span className="d-flex align-items-center">
                <Home size={18} className="me-1" />
                <span>Home</span>
              </span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/gallery" 
              className={isActive('/gallery') ? 'active' : ''}
            >
              <span className="d-flex align-items-center">
                <Image size={18} className="me-1" />
                <span>Gallery</span>
              </span>
            </Nav.Link>
          </Nav>
          
          <WalletConnect />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
