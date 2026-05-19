const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const https = require('https');

// Mock OTP storage (for development)
const otpStore = {};

// Helper to normalize phone numbers to +91
const normalizePhone = (phone) => {
  if (!phone) return phone;
  // Strip all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a 10 digit number, assume Indian and prepend +91
  if (cleaned.length === 10) return `+91${cleaned}`;
  
  // If it's 11 digits and starts with 1, it's a US number, convert to Indian (+91) per requirements
  if (cleaned.startsWith('1') && cleaned.length === 11) return `+91${cleaned.substring(1)}`;
  
  // If it's 12 digits and starts with 91, it's already Indian with country code, just add +
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  
  // Default: return the cleaned digits with a plus prefix
  return `+${cleaned}`;
};

exports.register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;
    phone = normalizePhone(phone);
    console.log(`[AUTH-SYSTEM] Registering user with phone: ${phone}`);

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
    let { phone } = req.body;
    console.log(`[AUTH-SYSTEM] sendOtp request received for: ${phone}`);
    
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    
    const originalPhone = phone;
    phone = normalizePhone(phone);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[phone] = { otp, expiry };

    console.log('\n\n================================================');
    console.log('🚀 [AUTH-SYSTEM] NEW OTP GENERATED');
    console.log(`📱 [PHONE] Normalized: ${phone}`);
    console.log(`🔑 [ACCESS CODE] --> ${otp} <--`);
    console.log(`⏰ [EXPIRY] ${new Date(expiry).toLocaleTimeString()}`);
    console.log('================================================\n\n');
    
    res.json({ 
      message: 'OTP sent successfully',
      devNote: `Check your backend terminal/console. The code is ${otp} (Logged for development)`
    });
  } catch (error) {
    console.error('[AUTH-SYSTEM] Send OTP Critical Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;
    phone = normalizePhone(phone);
    console.log(`[AUTH-SYSTEM] verifyOtp request: phone=${phone}, otp=${otp}`);
    
    if (!otpStore[phone] || otpStore[phone].otp !== otp || otpStore[phone].expiry < Date.now()) {
      console.log(`[AUTH-SYSTEM] Verification failed for ${phone}. Invalid or expired.`);
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    delete otpStore[phone];

    let user = await User.findByPhone(phone);
    if (!user) {
      console.log(`[AUTH-SYSTEM] User not found for ${phone}. Creating auto-profile.`);
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
    console.error('[AUTH-SYSTEM] Verify OTP Error:', error);
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
