const express = require('express');
const router = express.Router();
const { addToFavorites, removeFromFavorites, getMyFavorites } = require('../controllers/favoriteController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, getMyFavorites);
router.post('/', auth, addToFavorites);
router.delete('/:propertyId', auth, removeFromFavorites);

module.exports = router;
