const Property = require('../models/Property');
const axios = require('axios');

exports.createProperty = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "User authentication context missing." });
    }

    const images = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const image = images.length > 0 ? images[0] : null;

    if (!image) {
      return res.status(400).json({ success: false, error: "No images uploaded." });
    }

    let latitude = null;
    let longitude = null;

    const locality = req.body.locality || '';
    const city = req.body.city || '';
    const address = req.body.address || req.body.location || '';

    // Robust geocoding helper with India bounds validation
    const geocode = async (query) => {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: query, format: 'json', limit: 1, countrycodes: 'in' },
        headers: { 'User-Agent': 'NestFinder/1.0' },
        timeout: 5000
      });
      if (res.data && res.data.length > 0) {
        const lat = parseFloat(res.data[0].lat);
        const lon = parseFloat(res.data[0].lon);
        // Validate coordinates are within India
        if (lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97) {
          return { lat, lon };
        }
      }
      return null;
    };

    try {
      // Strategy 1: full address + locality + city (most accurate)
      let result = address
        ? await geocode(`${address}, ${locality}, ${city}, India`)
        : null;

      // Strategy 2: locality + city
      if (!result && locality) {
        result = await geocode(`${locality}, ${city}, India`);
      }

      // Strategy 3: city only as last resort
      if (!result && city) {
        result = await geocode(`${city}, India`);
      }

      if (result) {
        latitude = result.lat;
        longitude = result.lon;
      } else {
        console.warn(`[GEO] Could not geocode: ${address}, ${city}`);
      }
    } catch (err) {
      console.error('[GEO] Geocoding failed:', err.message);
    }

    // Final fallback: Kolkata coordinates
    latitude = latitude || 22.5726;
    longitude = longitude || 88.3639;

    console.log('FINAL LAT/LNG:', latitude, longitude);

    const propertyData = {
      ...req.body,
      ownerId: req.user.id,
      image,
      images,
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
    const { id } = req.params;
    const property = await Property.getById(id);
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Property.deleteById(id);

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};

exports.getLocationIntelligence = async (req, res) => {
  try {
    let { location, city, lat, lon } = req.query;

    if (!lat || !lon || lat === 'null' || lon === 'null' || isNaN(parseFloat(lat))) {
      try {
        // Attempt 1: Full Address + City
        if (location) {
          const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: `${location}, ${city || ''}, India`,
              format: "json",
              limit: 1
            },
            headers: { 'User-Agent': 'NestFinder/1.0' }
          });

          if (geo.data && geo.data.length > 0) {
            lat = geo.data[0].lat;
            lon = geo.data[0].lon;
          }
        }

        // Attempt 2: City Fallback
        if ((!lat || !lon) && city) {
          const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: `${city}, India`,
              format: "json",
              limit: 1
            },
            headers: { 'User-Agent': 'NestFinder/1.0' }
          });

          if (geo.data && geo.data.length > 0) {
            lat = geo.data[0].lat;
            lon = geo.data[0].lon;
          }
        }
      } catch (geoErr) {
        console.error("Geocoding failed in intelligence fetch:", geoErr.message);
      }
    }

    // Ensure valid coordinates exist for radius search - Final Fallback
    lat = lat || 22.5726;
    lon = lon || 88.3639;

    let data = {
      education: [],
      healthcare: [],
      connectivity: [],
      lifestyle: []
    };

    if (lat && lon) {
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="school"](around:2000, ${lat}, ${lon});
          node["amenity"="hospital"](around:2000, ${lat}, ${lon});
          node["railway"="station"](around:2000, ${lat}, ${lon});
          node["amenity"="restaurant"](around:2000, ${lat}, ${lon});
        );
        out;
      `;

      try {
        const response = await axios.post(
          "https://overpass-api.de/api/interpreter",
          overpassQuery,
          { headers: { "Content-Type": "text/plain" } }
        );

        response.data.elements.forEach(item => {
          if (item.tags?.amenity === "school") data.education.push(item.tags.name || "Unnamed School");
          else if (item.tags?.amenity === "hospital") data.healthcare.push(item.tags.name || "Unnamed Hospital");
          else if (item.tags?.railway === "station" || item.tags?.railway === "subway_entrance") data.connectivity.push(item.tags.name || "Unnamed Station");
          else if (item.tags?.amenity === "restaurant") data.lifestyle.push(item.tags.name || "Unnamed Restaurant");
        });

        // Limit each to 3-5 items
        data.education = data.education.slice(0, 5);
        data.healthcare = data.healthcare.slice(0, 5);
        data.connectivity = data.connectivity.slice(0, 5);
        data.lifestyle = data.lifestyle.slice(0, 5);
      } catch (overpassErr) {
        console.error("Overpass API error:", overpassErr.message);
      }
    }

    return res.json({
      success: true,
      data,
      lat,
      lon
    });

  } catch (error) {
    console.error("Intelligence Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch intelligence data"
    });
  }
};
