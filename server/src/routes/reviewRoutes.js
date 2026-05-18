const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middlewares/auth');

router.get('/:propertyId', reviewController.getPropertyReviews);
router.post('/', auth, reviewController.addReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
