const Property = require('../models/Property');
const User = require('../models/User');
const Report = require('../models/Report');
const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [propertyCount] = await db.execute('SELECT COUNT(*) as count FROM properties');
    const [pendingCount] = await db.execute('SELECT COUNT(*) as count FROM properties WHERE approvalStatus = "pending"');
    const [reportCount] = await db.execute('SELECT COUNT(*) as count FROM reports WHERE status = "pending"');

    res.json({
      users: userCount[0].count,
      properties: propertyCount[0].count,
      pendingApprovals: pendingCount[0].count,
      activeReports: reportCount[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.getAll({ isAdmin: true, approvalStatus: 'pending' });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending properties' });
  }
};

exports.approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    await Property.approve(id, status);
    res.json({ message: `Property ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property status' });
  }
};

exports.verifyProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    await Property.verify(id, isVerified);
    res.json({ message: 'Property verification status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.getAll();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.updateStatus(id, 'resolved');
    res.json({ message: 'Report resolved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
};
