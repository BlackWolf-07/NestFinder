const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "User authentication context missing." });
    }

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if (images.length === 0) {
        return res.status(400).json({ success: false, error: "No images uploaded." });
    }

    const propertyData = {
      ...req.body,
      ownerId: req.user.id,
      images,
      amenities: typeof req.body.amenities === "string" ? JSON.parse(req.body.amenities) : req.body.amenities,
      location: req.body.location || `${req.body.locality}, ${req.body.city}`,
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null
    };

    const id = await Property.create(propertyData);
    res.status(201).json({ success: true, message: "Property created", id });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create property" });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const data = await Property.getAll(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.getByOwner(req.user.id);
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your properties' });
  }
};

exports.getPropertyDetails = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await Property.update(req.params.id, req.body);
    res.json({ success: true, message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await Property.delete(req.params.id);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
};
