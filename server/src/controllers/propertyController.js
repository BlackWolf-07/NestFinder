const Property = require('../models/Property');
const axios = require('axios');

exports.createProperty = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "User authentication context missing." });
    }

    const image = req.files?.[0]?.path
      ? req.files[0].path.replace(/\\/g, "/")
      : null;

    let latitude = req.body.latitude || null;
    let longitude = req.body.longitude || null;

    const fullAddress = req.body.address || req.body.location || `${req.body.locality}, ${req.body.city}`;

    // Geocoding logic
    try {
      const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: fullAddress,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'NestFinder/1.0'
        }
      });

      if (geoRes.data && geoRes.data.length > 0) {
        latitude = geoRes.data[0].lat;
        longitude = geoRes.data[0].lon;
      }
    } catch (geoErr) {
      console.error("Geocoding failed:", geoErr.message);
    }

    const propertyData = {
      ...req.body,
      ownerId: req.user.id,
      image,
      address: req.body.address || req.body.location,
      contactNumber: req.body.contactNumber || null,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true ? 1 : 0,
      amenities: typeof req.body.amenities === "string" ? JSON.parse(req.body.amenities) : req.body.amenities,
      location: req.body.location || `${req.body.locality}, ${req.body.city}`,
      latitude,
      longitude
    };

    const id = await Property.create(propertyData);
    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      id
    });
  } catch (error) {
    console.error("Create Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getFeaturedProperties = async (req, res) => {
  try {
    const data = await Property.getFeatured();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Fetch Featured Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured properties",
    });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const data = await Property.getAll(req.query);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Fetch Properties Error:", error);
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

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    return res.json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    return res.status(500).json({ message: "Error fetching property" });
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
