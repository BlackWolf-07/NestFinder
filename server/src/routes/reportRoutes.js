const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, reportController.reportProperty);

module.exports = router;
