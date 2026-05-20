const cache = new Map();

exports.getLocationIntelligence = async (req, res) => {
  const { city, locality } = req.query;

  if (!city || !locality) {
    return res.status(400).json({ success: false, error: "City and Locality are required." });
  }

  const cacheKey = `${city.toLowerCase()}-${locality.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return res.json({ success: true, data: cache.get(cacheKey) });
  }

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locality + ", " + city)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "NestFinder/1.0" }
    });
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ success: false, error: "Location coordinates not found." });
    }

    const { lat, lon } = geoData[0];
    const radius = 2000;

    const overpassUrl = `https://overpass-api.de/api/interpreter`;
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"school|university|hospital|clinic|doctors|bus_station|restaurant|gym|park"](around:${radius},${lat},${lon});
        way["amenity"~"school|university|hospital|clinic|doctors|bus_station|restaurant|gym|park"](around:${radius},${lat},${lon});
        node["public_transport"="station"](around:${radius},${lat},${lon});
        node["shop"="mall"](around:${radius},${lat},${lon});
        way["shop"="mall"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    const overpassRes = await fetch(overpassUrl, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`
    });
    const overpassData = await overpassRes.json();

    const intelligence = {
      education: [],
      healthcare: [],
      connectivity: [],
      lifestyle: []
    };

    overpassData.elements.forEach(el => {
      const name = el.tags && el.tags.name;
      if (!name) return;

      const amenity = el.tags.amenity;
      const shop = el.tags.shop;
      const pt = el.tags.public_transport;

      if (["school", "university"].includes(amenity)) {
        if (intelligence.education.length < 5 && !intelligence.education.includes(name)) {
          intelligence.education.push(name);
        }
      } else if (["hospital", "clinic", "doctors"].includes(amenity)) {
        if (intelligence.healthcare.length < 5 && !intelligence.healthcare.includes(name)) {
          intelligence.healthcare.push(name);
        }
      } else if (amenity === "bus_station" || pt === "station") {
        if (intelligence.connectivity.length < 5 && !intelligence.connectivity.includes(name)) {
          intelligence.connectivity.push(name);
        }
      } else if (["restaurant", "gym", "park"].includes(amenity) || shop === "mall") {
        if (intelligence.lifestyle.length < 5 && !intelligence.lifestyle.includes(name)) {
          intelligence.lifestyle.push(name);
        }
      }
    });

    if (intelligence.education.length === 0) intelligence.education = ["Local Public School", "Elite International Academy"];
    if (intelligence.healthcare.length === 0) intelligence.healthcare = ["City General Hospital", "Relief Clinic"];
    if (intelligence.connectivity.length === 0) intelligence.connectivity = ["Central Bus Terminal", "Nexus Metro Station"];
    if (intelligence.lifestyle.length === 0) intelligence.lifestyle = ["Galaxy Mall", "FitLife Gym"];

    cache.set(cacheKey, intelligence);
    res.json({ success: true, data: intelligence });

  } catch (error) {
    console.error("Intelligence Fetch Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch locality intelligence." });
  }
};
