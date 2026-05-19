const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const https = require('https');

// Mock OTP storage
const otpStore = {};

// Improved Phone Normalization
const normalizePhone = (phone) => {
  if (!phone) return "";
  // Strip all non-numeric characters
  let cleaned = phone.toString().replace(/\D/g, '');

  // Handle Indian numbers
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  } else if (cleaned.length > 10 && !cleaned.startsWith('91')) {
      // If it has a different country code, just prepend +
      return `+${cleaned}`;
  }
  
  return `+${cleaned}`;
};

exports.register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;
    phone = normalizePhone(phone);

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'buyer'
    });

    const token = jwt.sign({ id: userId, email, role: role || 'buyer' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role: role || 'buyer' }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication failed. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Authentication failed. Invalid password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

    phone = normalizePhone(phone);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[phone] = { otp, expiry };

    console.log(`[AUTH] OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      devNote: `Code: ${otp}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;
    phone = normalizePhone(phone);

    const storedData = otpStore[phone];

    if (!storedData) {
        return res.status(400).json({ success: false, error: 'No OTP requested for this number' });
    }

    if (storedData.expiry < Date.now()) {
        delete otpStore[phone];
        return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    delete otpStore[phone];

    let user = await User.findByPhone(phone);
    if (!user) {
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
      success: true,
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
    res.status(500).json({ success: false, error: error.message || 'OTP verification failed' });
  }
};

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

    const googleUser = await new Promise((resolve, reject) => {
      https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

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

    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthError`);
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};
