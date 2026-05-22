const cache = new Map();

exports.getLocationIntelligence = async (req, res) => {
  const { city, locality, location, lat, lon } = req.query;

  if (!city && !locality && !location) {
    return res.status(400).json({ success: false, error: "City or locality is required." });
  }

  const cacheKey = `${(locality || '').toLowerCase()}-${(city || '').toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return res.json({ success: true, data: cache.get(cacheKey) });
  }

  try {
    let finalLat = lat && lat !== 'null' ? parseFloat(lat) : null;
    let finalLon = lon && lon !== 'null' ? parseFloat(lon) : null;

    // Geocode if no valid coordinates provided
    if (!finalLat || !finalLon || isNaN(finalLat)) {
      const searchQuery = location || `${locality}, ${city}`;
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=1&countrycodes=in`;
      const geoRes = await fetch(geoUrl, {
        headers: { "User-Agent": "NestFinder/1.0" }
      });

      if (!geoRes.ok) {
        return res.status(404).json({ success: false, error: "Geocoding service unavailable." });
      }

      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        return res.status(404).json({ success: false, error: "Location coordinates not found." });
      }

      finalLat = parseFloat(geoData[0].lat);
      finalLon = parseFloat(geoData[0].lon);
    }

    const radius = 3000;
    const overpassUrl = `https://overpass-api.de/api/interpreter`;
    const query = `[out:json][timeout:25];(nwr["amenity"~"school|college|university"](around:${radius},${finalLat},${finalLon});nwr["amenity"~"hospital|clinic|pharmacy|doctors|nursing_home"](around:${radius},${finalLat},${finalLon});nwr["healthcare"](around:${radius},${finalLat},${finalLon});node["railway"="station"](around:${radius},${finalLat},${finalLon});node["railway"="subway_entrance"](around:${radius},${finalLat},${finalLon});node["station"="subway"](around:${radius},${finalLat},${finalLon});node["public_transport"="station"](around:${radius},${finalLat},${finalLon});nwr["amenity"~"restaurant|cafe|gym"](around:${radius},${finalLat},${finalLon});nwr["shop"="mall"](around:${radius},${finalLat},${finalLon});nwr["leisure"="park"](around:${radius},${finalLat},${finalLon}););out center;`;

    const intelligence = {
      education: [],
      healthcare: [],
      connectivity: [],
      lifestyle: []
    };

    const overpassRes = await fetch(overpassUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://overpass-turbo.eu",
        "Referer": "https://overpass-turbo.eu/"
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(25000)
    });

    if (!overpassRes.ok) {
      console.error('[INTEL] Overpass API error:', overpassRes.status);
      return res.json({ success: true, data: intelligence, lat: finalLat, lon: finalLon });
    }

    const rawText = await overpassRes.text();
    let overpassData;
    try {
      overpassData = JSON.parse(rawText);
    } catch (e) {
      console.error('[INTEL] Overpass response not JSON:', rawText.slice(0, 200));
      return res.json({ success: true, data: intelligence, lat: finalLat, lon: finalLon });
    }

    overpassData.elements.forEach(el => {
      const name = el.tags?.name || el.tags?.['name:en'];
      if (!name) return;

      const amenity = el.tags?.amenity;
      const shop = el.tags?.shop;
      const pt = el.tags?.public_transport;
      const railway = el.tags?.railway;
      const station = el.tags?.station;
      const healthcare = el.tags?.healthcare;
      const leisure = el.tags?.leisure;

      if (["school", "college", "university"].includes(amenity)) {
        if (intelligence.education.length < 5 && !intelligence.education.includes(name))
          intelligence.education.push(name);
      } else if (["hospital", "clinic", "pharmacy", "doctors", "nursing_home"].includes(amenity) || healthcare) {
        if (intelligence.healthcare.length < 5 && !intelligence.healthcare.includes(name))
          intelligence.healthcare.push(name);
      } else if (
        railway === 'station' ||
        railway === 'subway_entrance' ||
        station === 'subway' ||
        el.tags?.metro === 'yes' ||
        pt === 'station' ||
        amenity === 'bus_station'
      ) {
        if (intelligence.connectivity.length < 5 && !intelligence.connectivity.includes(name))
          intelligence.connectivity.push(name);
      } else if (["restaurant", "cafe", "gym"].includes(amenity) || shop === "mall" || leisure === "park") {
        if (intelligence.lifestyle.length < 5 && !intelligence.lifestyle.includes(name))
          intelligence.lifestyle.push(name);
      }
    });

    cache.set(cacheKey, intelligence);
    res.json({ success: true, data: intelligence, lat: finalLat, lon: finalLon });

  } catch (error) {
    console.error("Intelligence Fetch Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch locality intelligence." });
  }
};
