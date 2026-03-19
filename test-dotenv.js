import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current __dirname:', __dirname);
console.log('Expected .env path:', path.resolve(__dirname, '../.env'));
console.log('.env exists:', fs.existsSync(path.resolve(__dirname, '../.env')));

// Try loading with explicit path
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('dotenv.config() result:', result);
console.log('Parsed vars:', result.parsed);

// Check environment variables
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);
