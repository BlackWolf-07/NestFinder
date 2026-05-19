const db = require('../config/db');

const User = {
  create: async (userData) => {
    const { name, email, phone, password, role, isVerified } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (name, email, phone, password, role, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
      [name || null, email || null, phone || null, password || null, role || 'buyer', isVerified || false]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    if (!email) return null;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findByPhone: async (phone) => {
    if (!phone) return null;
    const [rows] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT id, name, email, phone, role, profileImage, isVerified, createdAt FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Database initialization helper
  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin', 'owner', 'buyer') DEFAULT 'buyer',
        profileImage VARCHAR(255),
        isVerified BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);

    // FIX: Add isVerified column if it doesn't exist (for existing tables)
    try {
        await db.execute('ALTER TABLE users ADD COLUMN isVerified BOOLEAN DEFAULT FALSE');
        console.log('[DB] Column isVerified added to users table');
    } catch (err) {
        // Error code ER_DUP_COLUMN_NAME (1060) means column already exists
        if (err.errno !== 1060 && err.code !== 'ER_DUP_COLUMN_NAME') {
            console.error('[DB] Error adding isVerified column:', err.message);
        }
    }
  }
};

module.exports = User;
