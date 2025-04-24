// Script to create a test NFT image
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directories if they don't exist
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a simple NFT image
function createTestNFT() {
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, width, height);

  // Draw a simple pattern
  ctx.fillStyle = '#2980b9';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillRect(i * 100, j * 100, 100, 100);
      }
    }
  }

  // Add a circle
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
  ctx.fill();

  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Test NFT', width / 2, height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Created for Pinata Test', width / 2, height / 2 + 40);

  // Save the image
  const imagePath = path.join(imagesDir, 'test-nft.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);
  
  console.log(`✅ Test NFT image created at: ${imagePath}`);
  return imagePath;
}

try {
  const imagePath = createTestNFT();
  console.log('You can now run: node scripts/test-pinata.js');
} catch (error) {
  console.error('❌ Error creating test image:', error.message);
}
