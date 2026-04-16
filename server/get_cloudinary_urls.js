/**
 * get_cloudinary_urls.js
 * Lists all image URLs from the Cloudinary products folder
 * Run: node get_cloudinary_urls.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listAll() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'products/',
    max_results: 100,
  });

  console.log('\n📸 All Cloudinary Product Image URLs:\n');
  result.resources.forEach((r, i) => {
    console.log(`${i + 1}. ${r.secure_url}`);
  });
  console.log(`\nTotal: ${result.resources.length} images`);
}

listAll().catch(e => console.error('❌', e.message));
