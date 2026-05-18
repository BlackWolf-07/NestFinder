const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const propertyData = {
      ...req.body,
      ownerId: req.user.id,
      images,
      amenities: typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities
    };

    const id = await Property.create(propertyData);
    res.status(201).json({ message: 'Property listed successfully', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const data = await Property.getAll(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.getByOwner(req.user.id);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your properties' });
  }
};

exports.getPropertyDetails = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Property.update(req.params.id, req.body);
    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Property.delete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
