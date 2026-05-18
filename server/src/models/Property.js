const db = require('../config/db');

const Property = {
  create: async (propertyData) => {
    const {
      ownerId, title, type, category, location, city, locality,
      latitude, longitude, price, bhk, furnishing, amenities,
      description, images, neighborhood
    } = propertyData;

    const [result] = await db.execute(
      `INSERT INTO properties (
        ownerId, title, type, category, location, city, locality,
        latitude, longitude, price, bhk, furnishing, amenities,
        description, images, neighborhood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId, title, type, category, location, city, locality,
        latitude, longitude, price, bhk, furnishing, JSON.stringify(amenities),
        description, JSON.stringify(images), JSON.stringify(neighborhood || {})
      ]
    );
    return result.insertId;
  },

  getAll: async (filters = {}) => {
    let query = 'SELECT * FROM properties WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE 1=1';
    const params = [];
    const countParams = [];

    const addFilter = (condition, value) => {
      query += ` AND ${condition}`;
      countQuery += ` AND ${condition}`;
      params.push(value);
      countParams.push(value);
    };

    // Admin can see everything, but by default we show approved
    if (!filters.isAdmin) {
      addFilter('status = ?', 'available');
      addFilter('approvalStatus = ?', 'approved');
    }

    if (filters.city) addFilter('city LIKE ?', `%${filters.city}%`);
    if (filters.locality) addFilter('locality LIKE ?', `%${filters.locality}%`);
    if (filters.type) addFilter('type = ?', filters.type);
    if (filters.category) addFilter('category = ?', filters.category);
    if (filters.minPrice) addFilter('price >= ?', filters.minPrice);
    if (filters.maxPrice) addFilter('price <= ?', filters.maxPrice);
    if (filters.bhk) addFilter('bhk = ?', filters.bhk);
    if (filters.furnishing) addFilter('furnishing = ?', filters.furnishing);
    if (filters.approvalStatus) addFilter('approvalStatus = ?', filters.approvalStatus);

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    const [totalResult] = await db.execute(countQuery, countParams);
    
    let filteredRows = rows;
    // Client-side filtering for amenities (since it's a JSON array in MySQL)
    if (filters.amenities && Array.isArray(filters.amenities)) {
      filteredRows = rows.filter(row => {
        const propertyAmenities = typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities;
        return filters.amenities.every(a => propertyAmenities.includes(a));
      });
    }

    return {
      properties: filteredRows,
      total: totalResult[0].total,
      page,
      totalPages: Math.ceil(totalResult[0].total / limit)
    };
  },

  getByOwner: async (ownerId) => {
    const [rows] = await db.execute('SELECT * FROM properties WHERE ownerId = ?', [ownerId]);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
    return rows[0];
  },

  update: async (id, updateData) => {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return;

    const params = Object.values(updateData).map(val => 
      (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val
    );
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    params.push(id);

    await db.execute(`UPDATE properties SET ${setClause} WHERE id = ?`, params);
  },

  approve: async (id, status) => {
    await db.execute('UPDATE properties SET approvalStatus = ? WHERE id = ?', [status, id]);
  },

  verify: async (id, isVerified) => {
    await db.execute('UPDATE properties SET isVerified = ? WHERE id = ?', [isVerified, id]);
  },

  delete: async (id) => {
    await db.execute('DELETE FROM properties WHERE id = ?', [id]);
  },

  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ownerId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        type ENUM('rent', 'buy') NOT NULL,
        category ENUM('flat', 'house', 'PG', 'hostel', 'commercial') NOT NULL,
        location TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        locality VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        price DECIMAL(15, 2) NOT NULL,
        bhk INT,
        furnishing ENUM('unfurnished', 'semi-furnished', 'fully-furnished') DEFAULT 'unfurnished',
        amenities JSON,
        description TEXT,
        images JSON,
        neighborhood JSON,
        isVerified BOOLEAN DEFAULT FALSE,
        approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        status ENUM('available', 'rented', 'sold') DEFAULT 'available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = Property;
