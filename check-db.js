const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const User = require('./server/models/User');
    const Otp = require('./server/models/Otp');

    const users = await User.find({});
    console.log('Users:', users.map(u => u.email));

    const otps = await Otp.find({});
    console.log('OTPs:', otps);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();
