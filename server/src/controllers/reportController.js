const Report = require('../models/Report');

exports.reportProperty = async (req, res) => {
  try {
    const { propertyId, reason } = req.body;
    const reportData = {
      propertyId,
      userId: req.user.id,
      reason
    };

    const id = await Report.create(reportData);
    res.status(201).json({ success: true, message: 'Property reported successfully. Admin will review it.', id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to submit report' });
  }
};
