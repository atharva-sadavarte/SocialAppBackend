const User = require('../models/User');
const UserOTP = require('../models/UserOTP'); // Import the new model
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// ... (register, login, refreshToken, logout remain the same)

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ username, email, password });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
        userId: user._id
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    // Verify token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token expired or invalid' });

      // Issue new access token
      const newAccessToken = generateAccessToken(user._id);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to format date nicely (e.g., 11 APR 2026, 1:30 PM)
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date).toUpperCase();
};

// @desc    Forgot Password - Generate OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to UserOTP collection (We don't delete old ones to keep history)
    const newOTP = await UserOTP.create({
      email,
      otp: otpCode,
      createdAt,
      expiresAt
    });

    // Format times for display
    const formattedCreated = formatDateTime(createdAt);
    const formattedExpires = formatDateTime(expiresAt);

    // FOR NOW: Log to console so you can test without an email service
    console.log(`-------------------------------------------`);
    console.log(`[OTP HISTORY LOG] for ${email}`);
    console.log(`Code: ${otpCode}`);
    console.log(`Created At: ${formattedCreated}`);
    console.log(`Expires At: ${formattedExpires}`);
    console.log(`-------------------------------------------`);

    res.status(200).json({ 
      message: 'OTP generated and saved to history',
      otp: otpCode, // Sending it back for easy testing
      createdAt: formattedCreated,
      expiresAt: formattedExpires
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the latest record for this email and OTP
    const otpRecord = await UserOTP.findOne({ email, otp }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log(`[DEBUG] OTP Check Failed for email: ${email} and code: ${otp}`);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.status(200).json({ 
      message: 'OTP verified successfully',
      verifiedAt: formatDateTime(new Date())
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find the latest record for this email and OTP
    const otpRecord = await UserOTP.findOne({ email, otp }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log(`[DEBUG] OTP Check Failed in resetPassword for email: ${email} and code: ${otp}`);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP is valid, now find the user to update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. History preserved.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
