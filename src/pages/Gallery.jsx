import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NftGallery from '../components/NftGallery.jsx';

function Gallery() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center mb-5">
        <Col md={8}>
          <h1 className="fw-bold mb-3">Your NFT Gallery</h1>
          <p className="text-muted">
            View your collection of CryptoCanvas NFTs. Connect your wallet to see your owned tokens.
          </p>
        </Col>
      </Row>
      
      <NftGallery />
    </Container>
  );
}

export default Gallery;
