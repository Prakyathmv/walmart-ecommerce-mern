/**
 * list_cloudinary.js
 * Lists all images in the 'products' folder on Cloudinary
 * Run: node list_cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listImages() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'products/',
    max_results: 100,
  });

  console.log('\n📸 Cloudinary Product Images:\n');
  result.resources.forEach((r) => {
    console.log(`URL: ${r.secure_url}`);
    console.log(`Public ID: ${r.public_id}`);
    console.log('---');
  });
}

listImages().catch((err) => console.error('❌ Error:', err.message));
