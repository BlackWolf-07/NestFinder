const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const https = require('https');

// Mock OTP storage (for development)
const otpStore = {};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    const token = jwt.sign({ id: userId, email, role: role || 'buyer' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role: role || 'buyer' }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Authentication failed. Invalid password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// --- OTP LOGIN ---

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[phone] = { otp, expiry };

    // Mock sending OTP
    console.log(`[AUTH-SYSTEM] OTP for ${phone}: ${otp}`);
    
    res.json({ 
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!otpStore[phone] || otpStore[phone].otp !== otp || otpStore[phone].expiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    delete otpStore[phone];

    let user = await User.findByPhone(phone);
    if (!user) {
      // Auto-create user
      const userId = await User.create({
        name: `User_${phone.slice(-4)}`,
        phone,
        role: 'buyer',
        isVerified: true
      });
      user = await User.findById(userId);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// --- GOOGLE LOGIN ---

exports.googleAuth = (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${qs}`);
};

exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);

  try {
    // 1. Get token from code
    const tokenResponse = await new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString();

      const reqOpts = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
        },
      };

      const request = https.request(reqOpts, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => resolve(JSON.parse(data)));
      });
      request.on('error', reject);
      request.write(postData);
      request.end();
    });

    const { access_token } = tokenResponse;

    // 2. Get user info
    const googleUser = await new Promise((resolve, reject) => {
      https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    // 3. Login or Create user
    let user = await User.findByEmail(googleUser.email);
    if (!user) {
      const userId = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        profileImage: googleUser.picture,
        role: 'buyer',
        isVerified: true
      });
      user = await User.findById(userId);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthError`);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
