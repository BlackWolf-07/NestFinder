const express = require('express');
const router = express.Router();
const { recommendProperties, propertyChat, generalAssistant } = require('../controllers/aiController');
const { auth } = require('../middlewares/auth');

router.post('/recommend', auth, recommendProperties);
router.post('/chat/:id', propertyChat);
router.post('/assistant', generalAssistant);

module.exports = router;
