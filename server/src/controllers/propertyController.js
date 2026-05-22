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
      longitude,
      email: req.body.email || null
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
    const { id } = req.params;
    const property = await Property.getById(id);
    
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const newImages = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const existingImages = req.body.existingImages 
      ? (typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages)
      : [];

    const allImages = [...existingImages, ...newImages];
    const image = allImages.length > 0 ? allImages[0] : property.image;

    let latitude = property.latitude;
    let longitude = property.longitude;

    const locality = req.body.locality || property.locality;
    const city = req.body.city || property.city;
    const address = req.body.address || property.address;

    // Check if location changed to re-geocode
    if (locality !== property.locality || city !== property.city || address !== property.address) {
      const geocode = async (query) => {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: query, format: 'json', limit: 1, countrycodes: 'in' },
          headers: { 'User-Agent': 'NestFinder/1.0' },
          timeout: 5000
        });
        if (res.data && res.data.length > 0) {
          const lat = parseFloat(res.data[0].lat);
          const lon = parseFloat(res.data[0].lon);
          if (lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97) {
            return { lat, lon };
          }
        }
        return null;
      };

      try {
        let result = address
          ? await geocode(`${address}, ${locality}, ${city}, India`)
          : await geocode(`${locality}, ${city}, India`);

        if (result) {
          latitude = result.lat;
          longitude = result.lon;
        }
      } catch (err) {
        console.error('[GEO] Geocoding failed during update:', err.message);
      }
    }

    const updateData = {
      title: req.body.title || property.title,
      type: req.body.type || property.type,
      category: req.body.category || property.category,
      city: city,
      locality: locality,
      address: address,
      price: req.body.price || property.price,
      bhk: req.body.bhk || property.bhk,
      furnishing: req.body.furnishing || property.furnishing,
      description: req.body.description || property.description,
      contactNumber: req.body.contactNumber || property.contactNumber,
      email: req.body.email || property.email,
      amenities: req.body.amenities ? (typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities) : property.amenities,
      image,
      images: allImages,
      latitude,
      longitude,
      location: `${locality}, ${city}`
    };

    await Property.update(id, updateData);
    
    res.json({ success: true, message: 'Property updated successfully' });
  } catch (error) {
    console.error("Update Property Error:", error);
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
        [out:json][timeout:25];
        (
          nwr["amenity"="school"](around:3000, ${lat}, ${lon});
          nwr["amenity"="college"](around:3000, ${lat}, ${lon});
          nwr["amenity"="university"](around:3000, ${lat}, ${lon});
          nwr["amenity"="hospital"](around:3000, ${lat}, ${lon});
          nwr["amenity"="clinic"](around:3000, ${lat}, ${lon});
          nwr["amenity"="pharmacy"](around:3000, ${lat}, ${lon});
          nwr["healthcare"](around:3000, ${lat}, ${lon});
          node["railway"="station"](around:3000, ${lat}, ${lon});
          node["railway"="subway_entrance"](around:3000, ${lat}, ${lon});
          node["station"="subway"](around:3000, ${lat}, ${lon});
          node["metro"="yes"](around:3000, ${lat}, ${lon});
          nwr["amenity"="restaurant"](around:3000, ${lat}, ${lon});
          nwr["amenity"="cafe"](around:3000, ${lat}, ${lon});
          nwr["amenity"="mall"](around:3000, ${lat}, ${lon});
          nwr["shop"="mall"](around:3000, ${lat}, ${lon});
        );
        out center;
      `;

      try {
        const response = await axios.post(
          "https://overpass-api.de/api/interpreter",
          overpassQuery,
          { headers: { "Content-Type": "text/plain" }, timeout: 30000 }
        );
        console.log('[INTEL] Raw elements count:', response.data.elements.length);
        console.log('[INTEL] Sample:', JSON.stringify(response.data.elements.slice(0, 2)));

        response.data.elements.forEach(item => {
          const name = item.tags?.name || item.tags?.['name:en'] || null;
          if (!name) return; // skip unnamed places

          const amenity = item.tags?.amenity;
          const railway = item.tags?.railway;
          const station = item.tags?.station;
          const healthcare = item.tags?.healthcare;
          const shop = item.tags?.shop;

          if (['school', 'college', 'university'].includes(amenity)) {
            data.education.push(name);
          } else if (['hospital', 'clinic', 'pharmacy'].includes(amenity) || healthcare) {
            data.healthcare.push(name);
          } else if (
            railway === 'station' ||
            railway === 'subway_entrance' ||
            station === 'subway' ||
            item.tags?.metro === 'yes'
          ) {
            data.connectivity.push(name);
          } else if (['restaurant', 'cafe', 'mall'].includes(amenity) || shop === 'mall') {
            data.lifestyle.push(name);
          }
        });

        // Deduplicate and limit
        data.education = [...new Set(data.education)].slice(0, 5);
        data.healthcare = [...new Set(data.healthcare)].slice(0, 5);
        data.connectivity = [...new Set(data.connectivity)].slice(0, 5);
        data.lifestyle = [...new Set(data.lifestyle)].slice(0, 5);
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
