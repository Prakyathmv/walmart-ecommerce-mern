const { sendEmail } = require('./server/utils/send-email');
require('dotenv').config({ path: './server/.env' });

// Override with the provided key
process.env.RESEND_API_KEY = 're_cAPCZFup_JQXqJ6E516iEyf1jgUJs3Biq';

async function test() {
  try {
    const res = await sendEmail(
      'prakyathm411@gmail.com',
      'Test OTP from Resend',
      '<h1>123456</h1>',
      []
    );
    console.log('Success:', res);
  } catch (error) {
    console.error('Failed:', error);
  }
}

test();
