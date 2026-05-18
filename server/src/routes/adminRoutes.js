const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');

// All admin routes require admin role
router.use(auth, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/pending-properties', adminController.getPendingProperties);
router.patch('/properties/:id/approve', adminController.approveProperty);
router.patch('/properties/:id/verify', adminController.verifyProperty);
router.get('/reports', adminController.getAllReports);
router.patch('/reports/:id/resolve', adminController.resolveReport);

module.exports = router;
