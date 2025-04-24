/**
 * Update .env file with Pinata credentials
 */

const fs = require('fs');
const path = require('path');

// Pinata credentials
const apiKey = 'e1da966a11fa6e6f12bf';
const apiSecret = '96e0936299f2e21da3381b1de3d54a26ab0402ae27e069a34a7b2100b4a1fbde';
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMWI0M2ZhOC1kNWE4LTQ3MjQtOTM3NC0zZjMxM2VjYWFjYWEiLCJlbWFpbCI6ImdwZWxsZWdyaW5pQHNtdS5lZHUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTFkYTk2NmExMWZhNmU2ZjEyYmYiLCJzY29wZWRLZXlTZWNyZXQiOiI5NmUwOTM2Mjk5ZjJlMjFkYTMzODFiMWRlM2Q1NGEyNmFiMDQwMmFlMjdlMDY5YTM0YTdiMjEwMGI0YTFmYmRlIiwiZXhwIjoxNzc3MDY2OTM3fQ.Cj9pPfAv6dZ3RBK0zRz9r1UtNh-DHkiLcsTakKkVgF4';

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Read existing .env file or create a new one
let envContent = '';
try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
}

// Update or add Pinata credentials
const apiKeyRegex = /PINATA_API_KEY=.*/;
const apiSecretRegex = /PINATA_API_SECRET=.*/;
const jwtRegex = /PINATA_JWT=.*/;

if (apiKeyRegex.test(envContent)) {
  envContent = envContent.replace(apiKeyRegex, `PINATA_API_KEY=${apiKey}`);
} else {
  envContent += `\nPINATA_API_KEY=${apiKey}`;
}

if (apiSecretRegex.test(envContent)) {
  envContent = envContent.replace(apiSecretRegex, `PINATA_API_SECRET=${apiSecret}`);
} else {
  envContent += `\nPINATA_API_SECRET=${apiSecret}`;
}

if (jwtRegex.test(envContent)) {
  envContent = envContent.replace(jwtRegex, `PINATA_JWT=${jwt}`);
} else {
  envContent += `\nPINATA_JWT=${jwt}`;
}

// Write updated content to .env file
try {
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Pinata credentials successfully added to .env file!');
} catch (error) {
  console.error('Error updating .env file:', error.message);
}
