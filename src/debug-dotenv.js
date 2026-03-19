import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

console.log('envPath:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

// Call dotenv.config()
const result = dotenv.config({ path: envPath });

console.log('\ndotenv.config() result:');
console.log('error:', result.error);
console.log('parsed keys:', Object.keys(result.parsed || {}));

console.log('\nCloudinary vars after dotenv.config():');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);

console.log('\nAll parsed values:');
if (result.parsed) {
  for (const [key, value] of Object.entries(result.parsed)) {
    console.log(`${key}: ${value.substring(0, 30)}...`);
  }
}
