const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  country: { type: String, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: function() { return this.oauthProvider === 'local'; },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  oauthId: {
    type: String,
    sparse: true,
  },
  addresses: [addressSchema],
  preferences: {
    moods: [{ type: String, trim: true }],
    problems: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerifyToken: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Hash password before save
userSchema.pre('save', async function(next) {
  // Only hash if password is modified AND exists (skip OAuth users)
  if (!this.isModified('password') || !this.password) return next ? next() : null;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (next) next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Generate email verify token
userSchema.methods.getEmailVerifyToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
