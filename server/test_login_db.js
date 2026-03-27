const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function run() {
  try {
    console.log('Testing User model connection...');

    
    console.log(`Collection name: ${User.collection.collectionName}`);
    
    console.log(`Database name: ${User.db.name}`);

    const testEmail = `test_${Date.now()}@testlogin.com`;

    const newUser = new User({
      email: testEmail,
      password: 'password123',
      name: 'Verification User'
    });

    await newUser.save();
    console.log(`[PASS] User created successfully with email: ${newUser.email}`);

    const foundUser = await User.findOne({ email: testEmail });
    if (foundUser) {
      console.log('[PASS] User verified and queried successfully from the database!');
    } else {
      console.log('[FAIL] User not found after saving.');
    }
  } catch (error) {
    console.error('[FAIL] Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
