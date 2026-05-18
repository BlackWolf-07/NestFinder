const express = require('express');
const router = express.Router();
const { 
  createProperty, getProperties, getMyProperties, 
  getPropertyDetails, updateProperty, deleteProperty 
} = require('../controllers/propertyController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../utils/upload');

router.get('/', getProperties);
router.get('/my', auth, authorize('owner', 'admin'), getMyProperties);
router.get('/:id', getPropertyDetails);

router.post('/', auth, authorize('owner', 'admin'), upload.array('images', 10), createProperty);
router.put('/:id', auth, authorize('owner', 'admin'), updateProperty);
router.delete('/:id', auth, authorize('owner', 'admin'), deleteProperty);

module.exports = router;
