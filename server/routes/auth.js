const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== Helper Functions ====================

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

// Validation middleware
const validateEmail = body('email').isEmail().normalizeEmail();
const validatePassword = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

// ==================== Register ====================
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

      // Check if user already exists
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

      // Create user
      user = new User({ email, password, name });
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return response
      res.status(201).json({
        success: true,
        data: {
          accessToken: token,
          expiresIn: 86400, // 1 day in seconds
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

// ==================== Login ====================
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

      // Find user and select password field
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

      // Check password
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

      // Generate token
      const token = generateToken(user._id);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          accessToken: token,
          expiresIn: 86400, // 1 day in seconds
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

// ==================== Forgot Password ====================
router.post(
  '/forgot-password',
  [validateEmail],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return res.status(200).json({
          success: true,
          data: {
            message: 'If that account exists, a password reset email has been sent.',
          },
        });
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Save hashed token and expiry to user (hash the token for security)
      user.resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // In production, send email with reset link:
      // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      // await sendEmail(user.email, 'Password Reset Link', resetUrl);

      res.status(200).json({
        success: true,
        data: {
          message: 'If that account exists, a password reset email has been sent.',
          // For testing purposes, return token (remove in production)
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

// ==================== Reset Password ====================
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

      // Verify token
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

      // Update password
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

// ==================== Get Current User ====================
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

// ==================== Admin User Management ====================

// GET all users (Admin only)
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

// UPDATE user (Admin only)
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

// DELETE user (Admin only)
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
