const express = require('express');
const router = express.Router();
const { 
  createProperty, getProperties, getMyProperties, 
  getPropertyDetails, updateProperty, deleteProperty,
  getFeaturedProperties, getPropertyById, getLocationIntelligence,
  downloadAgreement, verifyProperty
} = require('../controllers/propertyController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../utils/upload');

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/my', auth, getMyProperties);
router.get('/intelligence', getLocationIntelligence);
router.get('/:id/agreement', auth, downloadAgreement);
router.get('/:id', getPropertyById);

router.post('/create', auth, upload.array('images', 10), createProperty);
router.put('/:id/verify', auth, authorize('admin'), verifyProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;
