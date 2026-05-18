const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus, downloadAgreement } = require('../controllers/bookingController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, createBooking);
router.get('/', auth, getMyBookings);
router.put('/:id/status', auth, updateBookingStatus);
router.get('/:id/agreement', auth, downloadAgreement);

module.exports = router;
