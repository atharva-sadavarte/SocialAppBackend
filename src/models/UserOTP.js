const mongoose = require('mongoose');

const userOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// We removed the TTL index here so that the OTPs stay in the database as history.
// You can now see multiple OTPs for the same user.

module.exports = mongoose.model('UserOTP', userOTPSchema, 'userOTP');
