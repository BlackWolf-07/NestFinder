const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const reviewData = {
      propertyId,
      userId: req.user.id,
      rating,
      comment
    };

    const id = await Review.create(reviewData);
    res.status(201).json({ message: 'Review added successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
};

exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.getByProperty(req.params.propertyId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.delete(req.params.id, req.user.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
