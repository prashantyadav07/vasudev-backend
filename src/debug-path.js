import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('envPath:', envPath);
console.log('Expected .env location:', envPath);

import fs from 'fs';
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env file content (first 200 chars):');
  console.log(content.substring(0, 200));
}
