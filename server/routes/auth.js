const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/send-email');
const Otp = require('../models/Otp');

const router = express.Router();




const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};


const validateEmail = body('email').isEmail().normalizeEmail();
const validatePassword = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');


router.post(
  '/register',
  [
    validateEmail,
    validatePassword,
    body('name').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          }, {}),
        },
      });
    }

    try {
      const { email, password, name } = req.body;


      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User already exists',
            details: { email: 'Email already registered' },
          },
        });
      }


      user = new User({ email, password, name });
      await user.save();


      const token = generateToken(user._id);


      res.status(201).json({
        success: true,
        data: {
          accessToken: token,
          expiresIn: 86400,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('REGISTRATION ERROR:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error during registration: ' + error.message,
        },
      });
    }
  }
);


router.post(
  '/login',
  [
    validateEmail,
    validatePassword,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          }, {}),
        },
      });
    }

    try {
      const { email, password } = req.body;


      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Invalid email or password',
          },
        });
      }


      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Invalid email or password',
          },
        });
      }


      const token = generateToken(user._id);


      res.status(200).json({
        success: true,
        data: {
          accessToken: token,
          expiresIn: 86400,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error during login',
        },
      });
    }
  }
);


router.post(
  '/forgot-password',
  [validateEmail],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {

        return res.status(200).json({
          success: true,
          data: {
            message: 'If that account exists, a password reset email has been sent.',
          },
        });
      }


      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });


      user.resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpire = new Date(Date.now() + 3600000);
      await user.save();





      res.status(200).json({
        success: true,
        data: {
          message: 'If that account exists, a password reset email has been sent.',

          resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error during password reset request',
        },
      });
    }
  }
);


router.post(
  '/send-otp',
  [validateEmail],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Invalid email' } });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found. Please register first.' } });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.deleteMany({ email });
      await Otp.create({ email, otp: otpCode });

      const subject = 'Your Login Verification Code';
      const html = `<h2>Walmart Clone Verification</h2><p>Your one-time password is: <strong>${otpCode}</strong></p><p>This code will expire in 5 minutes.</p>`;

      await sendEmail(email, subject, html);

      res.status(200).json({ success: true, data: { message: 'OTP sent successfully' } });
    } catch (error) {
      console.error('OTP Send Error:', error);
      res.status(500).json({ success: false, error: { message: 'Server error sending OTP' } });
    }
  }
);


router.post(
  '/verify-otp',
  [
    validateEmail,
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Invalid data formatting' } });
    }

    try {
      const { email, otp } = req.body;

      const validOtp = await Otp.findOne({ email, otp });
      if (!validOtp) {
        return res.status(400).json({ success: false, error: { message: 'Invalid or expired OTP' } });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }

      await Otp.deleteMany({ email });

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        data: {
          accessToken: token,
          expiresIn: 86400,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('OTP Verify Error:', error);
      res.status(500).json({ success: false, error: { message: 'Server error verifying OTP' } });
    }
  }
);


router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          }, {}),
        },
      });
    }

    try {
      const { token, newPassword } = req.body;


      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or expired reset token',
          },
        });
      }


      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset successful',
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message === 'jwt expired' ? 'Reset token has expired' : 'Invalid reset token',
        },
      });
    }
  }
);


router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error fetching user',
      },
    });
  }
});




router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error fetching users' },
    });
  }
});


router.put('/users/:id', protect, async (req, res) => {
  try {
    const { name, role } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    user.name = name || user.name;
    user.role = role || user.role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error updating user' },
    });
  }
});


router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error deleting user' },
    });
  }
});

module.exports = router;
