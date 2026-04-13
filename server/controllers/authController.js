const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokens, generateAccessToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
let mockUserSession = null;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (process.env.USE_MOCK_DATA === 'true') {
    const emailKey = email || 'mock@example.com';
    mockUserSession = mockDb[emailKey] || {
      _id: 'mock_user_' + Date.now(),
      name: name || 'Mock User',
      email: emailKey,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`,
      role: 'user',
      isEmailVerified: true,
      addresses: []
    };
    mockDb[emailKey] = mockUserSession;
    return sendTokens(res, mockUserSession, 201);
  }

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  // Generate email verify token
  const verifyToken = user.getEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'BookSmart — Verify Your Email',
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #2C1F0E; color: #F2E4C8; border-radius: 20px;">
          <h1 style="color: #FFB347; font-family: 'Fredoka One', cursive;">Welcome to BookSmart! 📚</h1>
          <p>Hi ${user.name},</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #2D6A4F; color: white; text-decoration: none; border-radius: 14px; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p style="color: #8A7A6A; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    user.emailVerifyToken = undefined;
    await user.save({ validateBeforeSave: false });
    // Don't fail registration if email fails — user can request resend
  }

  sendTokens(res, user, 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (process.env.USE_MOCK_DATA === 'true') {
    const emailKey = email || 'mohitdas852@gmail.com';
    mockUserSession = mockDb[emailKey] || {
      _id: 'mock_user_login',
      name: 'Mohit Kourav',
      email: emailKey,
      avatar: 'https://ui-avatars.com/api/?name=Mohit+Kourav&background=random',
      role: 'admin',
      isEmailVerified: true,
      addresses: []
    };
    mockDb[emailKey] = mockUserSession;
    return sendTokens(res, mockUserSession);
  }

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.oauthProvider !== 'local') {
    res.status(400);
    throw new Error(`Please sign in with ${user.oauthProvider}`);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendTokens(res, user);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const token = req.token;

  // Blacklist token in Redis if available
  try {
    const { redisClient } = require('../middleware/authMiddleware');
    if (redisClient) {
      await redisClient.set(`blacklist:${token}`, 'true', { EX: 900 }); // 15 min
    }
  } catch (e) {
    // Redis not available — token will expire naturally
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    mockUserSession = null;
  }

  // Clear refresh token cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with cookie)
const refreshToken = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true') {
     if (!mockUserSession) {
        res.status(401);
        throw new Error('No mock session — please log in');
     }
     return res.status(200).json({ success: true, accessToken: 'mock_access_token', expiresIn: 3600 });
  }
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token — please log in');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found — please register');
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid refresh token — please log in again');
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'BookSmart — Password Reset',
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #2C1F0E; color: #F2E4C8; border-radius: 20px;">
          <h1 style="color: #FFB347;">Password Reset 🔐</h1>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #C8603A; color: white; text-decoration: none; border-radius: 14px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="color: #8A7A6A; font-size: 12px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  if (!req.body.password) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokens(res, user);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ emailVerifyToken: hashedToken });

  if (!user) {
    res.status(400);
    throw new Error('Invalid verification token');
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true') {
    if (!mockUserSession) {
      res.status(401);
      throw new Error('Not logged in');
    }
    return res.status(200).json({ success: true, data: mockUserSession });
  }
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// Persistent mock storage for session duration
const mockDb = {};

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, preferences, addresses } = req.body;

  if (process.env.USE_MOCK_DATA === 'true') {
    if (mockUserSession) {
        if (name) mockUserSession.name = name;
        if (phone) mockUserSession.phone = phone;
        if (avatar) mockUserSession.avatar = avatar;
        if (preferences) mockUserSession.preferences = preferences;
        if (addresses) mockUserSession.addresses = addresses;
        
        // Save to our session-level mock DB
        if (mockUserSession.email) {
            mockDb[mockUserSession.email] = { ...mockUserSession };
        }
    }
    return res.status(200).json({ success: true, data: mockUserSession });
  }

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (phone) fieldsToUpdate.phone = phone;
  if (avatar) fieldsToUpdate.avatar = avatar;
  if (preferences) fieldsToUpdate.preferences = preferences;
  if (addresses) fieldsToUpdate.addresses = addresses;

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokens(res, user);
});

const { OAuth2Client } = require('google-auth-library');

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (process.env.USE_MOCK_DATA === 'true') {
    const emailKey = 'mock_google@example.com';
    mockUserSession = mockDb[emailKey] || {
      _id: 'mock_user_123',
      name: 'Google Mock User',
      email: emailKey,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      role: 'user',
      isEmailVerified: true,
      oauthProvider: 'google',
      addresses: []
    };
    mockDb[emailKey] = mockUserSession;
    return sendTokens(res, mockUserSession, 200);
  }

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  // Verify the Google token
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid Google token. Please try again.');
  }

  // Extract user info from Google
  const {
    sub: googleId,        // Unique Google user ID
    email,
    name,
    picture: avatar,
    email_verified,
  } = payload;

  if (!email_verified) {
    res.status(400);
    throw new Error('Google email is not verified');
  }

  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) {
    // User exists — check if they registered with email/password
    if (user.oauthProvider === 'local') {
      // They registered with email — link their Google account
      user.oauthProvider = 'google';
      user.oauthId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    }
    // User already has Google OAuth — just login
  } else {
    // New user — create account
    user = await User.create({
      name,
      email,
      avatar,
      oauthProvider: 'google',
      oauthId: googleId,
      isEmailVerified: true,    // Google already verified the email
      password: undefined,      // No password for OAuth users
    });
  }

  // Issue JWT tokens (same as regular login)
  sendTokens(res, user, 200);
});

// @desc    Google login via userinfo (access_token flow)
// @route   POST /api/auth/google-token
// @access  Public
const googleLoginWithToken = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatar, emailVerified } = req.body;

  if (process.env.USE_MOCK_DATA === 'true') {
    const emailKey = email || 'google@example.com';
    mockUserSession = mockDb[emailKey] || {
      _id: 'mock_google_' + (googleId || Date.now()),
      name: name || 'Google User',
      email: emailKey,
      avatar: avatar || 'https://ui-avatars.com/api/?name=G&background=random',
      role: 'user',
      isEmailVerified: true,
      oauthProvider: 'google',
      addresses: []
    };
    mockDb[emailKey] = mockUserSession;
    return sendTokens(res, mockUserSession, 200);
  }

  if (!email || !googleId) {
    res.status(400);
    throw new Error('Google user info is incomplete');
  }

  if (!emailVerified) {
    res.status(400);
    throw new Error('Google email is not verified');
  }

  // Find or create user
  let user = await User.findOne({ email });

  if (user) {
    // Link Google to existing account if needed
    if (!user.oauthId) {
      user.oauthId = googleId;
      user.oauthProvider = 'google';
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Create new user from Google
    user = await User.create({
      name,
      email,
      avatar: avatar || '',
      oauthProvider: 'google',
      oauthId: googleId,
      isEmailVerified: true,
      password: undefined,
    });
  }

  sendTokens(res, user, 200);
});

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400);
        throw new Error('Phone number is required');
    }

    if (process.env.USE_MOCK_DATA === 'true') {
        return res.status(200).json({ success: true, message: `Mock OTP sent to ${phone}. Code: 123456` });
    }

    // Real SMS logic would go here (Twilio, etc.)
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (process.env.USE_MOCK_DATA === 'true') {
        if (otp === '123456') {
            const emailKey = (phone || 'user') + '@phone.com';
            mockUserSession = mockDb[emailKey] || {
                _id: 'mock_user_' + (phone ? phone.replace(/\D/g, '') : Date.now()),
                name: 'User ' + (phone || ''),
                email: emailKey,
                phone: phone,
                role: 'user',
                isEmailVerified: true,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phone || 'U')}&background=random`,
                addresses: []
            };
            mockDb[emailKey] = mockUserSession;
            return sendTokens(res, mockUserSession, 200);
        } else {
            res.status(400);
            throw new Error('Invalid OTP');
        }
    }

    // Real verification logic here
    res.status(200).json({ success: true });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  updateProfile,
  changePassword,
  googleLogin,
  googleLoginWithToken,
  sendOTP,
  verifyOTP
};
