const express = require('express');
const router = express.Router();
const { 
  createProperty, getProperties, getMyProperties, 
  getPropertyDetails, updateProperty, deleteProperty 
} = require('../controllers/propertyController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../utils/upload');

router.get('/', getProperties);
router.get('/my', auth, getMyProperties);
router.get('/:id', getPropertyDetails);

router.post('/create', auth, upload.array('images', 10), createProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;
