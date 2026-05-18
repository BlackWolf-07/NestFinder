const db = require('../config/db');

const User = {
  create: async (userData) => {
    const { name, email, phone, password, role } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, password, role || 'buyer']
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT id, name, email, phone, role, profileImage, createdAt FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Database initialization helper
  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'owner', 'buyer') DEFAULT 'buyer',
        profileImage VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = User;
