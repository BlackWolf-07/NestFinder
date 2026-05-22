const db = require('../config/db');

const Property = {
  create: async (propertyData) => {
    const {
      ownerId, title, type, category, location, address, city, locality,
      latitude, longitude, price, bhk, furnishing, amenities,
      description, image, images, neighborhood, contactNumber, isFeatured
    } = propertyData;

    const [result] = await db.execute(
      `INSERT INTO properties (
        ownerId, title, type, category, location, address, city, locality,
        latitude, longitude, price, bhk, furnishing, amenities,
        description, image, images, neighborhood, contactNumber, isFeatured, approvalStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId, title, type, category, location, address || null, city, locality,
        latitude || null, longitude || null, price, bhk, furnishing, JSON.stringify(amenities),
        description, image || null, JSON.stringify(images || []), JSON.stringify(neighborhood || {}),
        contactNumber || null, isFeatured || 0, 'approved'
      ]
    );
    return result.insertId;
  },

  getFeatured: async () => {
    const [rows] = await db.execute(`
      SELECT p.*, AVG(r.rating) as avgRating 
      FROM properties p 
      LEFT JOIN reviews r ON p.id = r.propertyId 
      WHERE p.isFeatured = 1
      AND (p.status = 'available' OR p.status IS NULL)
      GROUP BY p.id
      ORDER BY p.createdAt DESC
      LIMIT 8
    `);
    return rows;
  },

  getAll: async (filters = {}) => {
    let query = `
      SELECT p.*, AVG(r.rating) as avgRating 
      FROM properties p 
      LEFT JOIN reviews r ON p.id = r.propertyId 
      WHERE p.status = "available"
    `;
    const params = [];

    if (filters.city) {
      query += ' AND p.city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    if (filters.locality) {
      query += ' AND p.locality LIKE ?';
      params.push(`%${filters.locality}%`);
    }
    if (filters.type) {
      query += ' AND p.type = ?';
      params.push(filters.type);
    }
    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    query += ' GROUP BY p.id ORDER BY p.createdAt DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  getByOwner: async (ownerId) => {
    const [rows] = await db.execute(`
      SELECT p.*, AVG(r.rating) as avgRating 
      FROM properties p 
      LEFT JOIN reviews r ON p.id = r.propertyId 
      WHERE p.ownerId = ?
      GROUP BY p.id
    `, [ownerId]);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute(`
      SELECT p.*, AVG(r.rating) as avgRating 
      FROM properties p 
      LEFT JOIN reviews r ON p.id = r.propertyId 
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    return rows[0];
  },

  findById: async (id) => {
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

  deleteById: async (id) => {
    await db.execute(
      "DELETE FROM properties WHERE id = ?",
      [id]
    );
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
        address TEXT,
        city VARCHAR(100) NOT NULL,
        locality VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        price DECIMAL(15, 2) NOT NULL,
        bhk INT,
        furnishing ENUM('unfurnished', 'semi-furnished', 'fully-furnished') DEFAULT 'unfurnished',
        amenities JSON,
        description TEXT,
        image TEXT,
        images JSON,
        contactNumber VARCHAR(20),
        neighborhood JSON,
        isVerified BOOLEAN DEFAULT FALSE,
        isFeatured BOOLEAN DEFAULT FALSE,
        approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        status ENUM('available', 'rented', 'sold') DEFAULT 'available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);

    // Auto-migrate: add missing columns to existing table
    const migrations = [
      `ALTER TABLE properties ADD COLUMN address TEXT`,
      `ALTER TABLE properties ADD COLUMN image TEXT`,
      `ALTER TABLE properties ADD COLUMN images JSON`,
      `ALTER TABLE properties ADD COLUMN contactNumber VARCHAR(20)`,
      `ALTER TABLE properties ADD COLUMN isFeatured BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE properties ADD COLUMN isVerified BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE properties ADD COLUMN latitude DECIMAL(10, 8)`,
      `ALTER TABLE properties ADD COLUMN longitude DECIMAL(11, 8)`,
      `ALTER TABLE properties ADD COLUMN neighborhood JSON`,
      // Fix corrupted image paths with double slashes in existing records
      `UPDATE properties SET image = REPLACE(image, '//uploads/', '/uploads/') WHERE image LIKE '//%'`,
    ];

    for (const migration of migrations) {
      try {
        await db.execute(migration);
      } catch (err) {
        // Silently ignore "column already exists" errors (code 1060)
        if (err.errno !== 1060) {
          console.error('Migration warning:', err.message);
        }
      }
    }
    console.log('Properties table ready');
  }
};

module.exports = Property;

