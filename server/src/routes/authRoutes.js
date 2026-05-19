const express = require('express');
const router = express.Router();
const { register, login, getMe, sendOtp, verifyOtp, googleAuth, googleCallback } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', auth, getMe);

module.exports = router;
