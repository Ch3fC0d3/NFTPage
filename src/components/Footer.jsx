import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h3 className="h5 mb-3">CryptoCanvas</h3>
            <p className="text-muted small">
              Create, collect, and trade unique digital artwork as NFTs on the Ethereum blockchain.
            </p>
          </Col>
          
          <Col md={4}>
            <h3 className="h5 mb-3">Resources</h3>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">
                  Documentation
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">
                  Smart Contract
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">
                  OpenSea Collection
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">
                  FAQ
                </a>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h3 className="h5 mb-3">Connect</h3>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted">
                <Twitter size={20} />
              </a>
            </div>
          </Col>
        </Row>
        
        <div className="text-center mt-4 pt-3 border-top border-secondary">
          <p className="mb-0 text-muted small">
            <span className="d-inline-flex align-items-center">
              Made with <Heart size={14} className="mx-1 text-danger" /> by CryptoCanvas Team
            </span>
            <span className="ms-2">© {new Date().getFullYear()}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
