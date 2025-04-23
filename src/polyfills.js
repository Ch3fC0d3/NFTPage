// Buffer polyfill for ethers.js
import { Buffer } from 'buffer';

// Add Buffer to window for ethers.js
window.Buffer = Buffer;
