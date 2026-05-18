const Favorite = require('../models/Favorite');

exports.addToFavorites = async (req, res) => {
  try {
    await Favorite.add(req.user.id, req.body.propertyId);
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    await Favorite.remove(req.user.id, req.params.propertyId);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.getByUser(req.user.id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};
