const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load variables from .env if present
dotenv.config();

const output = `export default {
  APPWRITE_ENDPOINT: '${process.env.APPWRITE_ENDPOINT || ''}',
  APPWRITE_PROJECT_ID: '${process.env.APPWRITE_PROJECT_ID || ''}',
  APPWRITE_DATABASE_ID: '${process.env.APPWRITE_DATABASE_ID || ''}',
  APPWRITE_POSTS_COLLECTION_ID: '${process.env.APPWRITE_POSTS_COLLECTION_ID || ''}',
  APPWRITE_BUCKET_ID: '${process.env.APPWRITE_BUCKET_ID || ''}'
};\n`;

fs.writeFileSync(path.join(__dirname, 'env.js'), output);
