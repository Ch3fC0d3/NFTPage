/**
 * Pinata API Routes
 * 
 * This module provides API endpoints for Pinata IPFS integration.
 */

const express = require('express');
const router = express.Router();
require('dotenv').config();

// Get Pinata JWT token from environment variables
const PINATA_JWT = process.env.PINATA_JWT;

// Endpoint to securely provide the JWT token to the frontend
router.get('/token', (req, res) => {
  if (!PINATA_JWT) {
    return res.status(500).json({ error: 'Pinata JWT token not configured' });
  }
  
  res.json({ jwt: PINATA_JWT });
});

module.exports = router;
