const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'wastewise_hackathon_super_secret_jwt_key_2026!', {
    expiresIn: '30d'
  });
};

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'citizen',
      ecoPoints: role === 'citizen' ? 50 : 0,
      badges: role === 'citizen' ? [{ name: 'Eco Starter', icon: '🌱', earnedAt: new Date() }] : []
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider || 'local',
        ecoPoints: user.ecoPoints,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider || 'local',
        ecoPoints: user.ecoPoints,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider || 'local',
        ecoPoints: user.ecoPoints,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc 1-Click Demo Login for presentations (Disabled for production launch)
// @route POST /api/auth/demo-login
const demoLogin = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Demo login is disabled in production. Please sign in with your Google account or email.'
  });
};

// @desc Google OAuth authentication
// @route POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken, role, isDemo, demoProfile } = req.body;

    let email, name, avatar, googleId;

    if (accessToken) {
      // Real Google OAuth2 popup access token verification
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await userInfoRes.json();

        if (data.error || !data.email) {
          return res.status(400).json({
            success: false,
            message: data.error_description || 'Failed to verify Google account'
          });
        }

        email = data.email.toLowerCase();
        name = data.name || data.given_name || email.split('@')[0];
        avatar = data.picture || '';
        googleId = data.sub;
      } catch (tokenErr) {
        return res.status(400).json({
          success: false,
          message: 'Failed to verify Google access token: ' + tokenErr.message
        });
      }
    } else if (isDemo && demoProfile) {
      // Demo / simulated Google account for hackathon evaluations
      email = demoProfile.email?.toLowerCase();
      name = demoProfile.name || 'Google Eco User';
      avatar = demoProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      googleId = demoProfile.googleId || `demo-google-${Date.now()}`;
    } else if (credential) {
      // Real Google Identity Services ID token verification
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        const data = await response.json();

        if (data.error || !data.email) {
          return res.status(400).json({
            success: false,
            message: data.error_description || 'Invalid Google credential token'
          });
        }

        if (process.env.GOOGLE_CLIENT_ID && data.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(400).json({
            success: false,
            message: 'Google token audience mismatch'
          });
        }

        email = data.email.toLowerCase();
        name = data.name || data.given_name || email.split('@')[0];
        avatar = data.picture || '';
        googleId = data.sub;
      } catch (tokenErr) {
        return res.status(400).json({
          success: false,
          message: 'Failed to verify Google token: ' + tokenErr.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google credential, access token, or demo payload is required.'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not resolve email from Google authentication.'
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email }, { googleId }]
    });

    const ADMIN_WHITELIST = ['balisaikumar9491@gmail.com', 'admin@wastewise.org'];
    const isAdminEmail = ADMIN_WHITELIST.includes(email.toLowerCase());

    const targetRole = isAdminEmail ? 'admin' : (['citizen', 'collector', 'admin'].includes(role) ? role : 'citizen');

    if (user) {
      let updated = false;
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        updated = true;
      }
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (avatar && (!user.avatar || user.avatar !== avatar)) {
        user.avatar = avatar;
        updated = true;
      }
      if (!user.authProvider || user.authProvider === 'local') {
        user.authProvider = 'google';
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user with Google profile
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        authProvider: 'google',
        role: targetRole,
        ecoPoints: targetRole === 'citizen' ? 50 : 0,
        badges: targetRole === 'citizen' ? [{ name: 'Eco Starter', icon: '🌱', earnedAt: new Date() }] : []
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider || 'google',
        ecoPoints: user.ecoPoints,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
  googleAuth
};
