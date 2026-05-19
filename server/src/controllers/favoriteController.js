const Favorite = require('../models/Favorite');

exports.addToFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await Favorite.add(req.user.id, req.body.propertyId);
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add to favorites' });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await Favorite.remove(req.user.id, req.params.propertyId);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to remove from favorites' });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const favorites = await Favorite.getByUser(req.user.id);
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch favorites' });
  }
};
