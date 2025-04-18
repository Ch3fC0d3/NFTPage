import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCode2, Shield, CreditCard } from 'lucide-react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import MintNft from '../components/MintNft';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary bg-gradient text-white py-5">
        <Container className="py-4">
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h1 className="display-4 fw-bold mb-4">
                Collect Unique Digital Art on the Blockchain
              </h1>
              <p className="lead mb-4">
                CryptoCanvas is a premium NFT collection featuring unique digital artwork secured by smart contracts on the Ethereum blockchain.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link to="/gallery">
                  <Button variant="light" size="lg" className="text-primary">
                    View Collection
                  </Button>
                </Link>
                <a href="#mint">
                  <Button variant="outline-light" size="lg">
                    Mint NFT
                  </Button>
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Why CryptoCanvas?</h2>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <FileCode2 size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">ERC-721 Standard</h3>
                  <p className="text-muted">
                    Built on the Ethereum blockchain using the ERC-721 standard for maximum compatibility with marketplaces and wallets.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <Shield size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">Secure Ownership</h3>
                  <p className="text-muted">
                    Your NFT ownership is secured by the Ethereum blockchain, providing immutable proof of authenticity and provenance.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-3 d-inline-flex mb-3">
                    <CreditCard size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-2">Easy Transactions</h3>
                  <p className="text-muted">
                    Buy, sell, and trade your NFTs with ease using MetaMask or any other Ethereum-compatible wallet.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mint Section */}
      <section id="mint" className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow border-0">
                <Card.Body className="p-4">
                  <h2 className="text-center mb-4 fw-bold">Mint Your NFT</h2>
                  <MintNft />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default Home;
