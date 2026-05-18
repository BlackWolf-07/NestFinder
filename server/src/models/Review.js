const db = require('../config/db');

const Review = {
  create: async (reviewData) => {
    const { propertyId, userId, rating, comment } = reviewData;
    const [result] = await db.execute(
      'INSERT INTO reviews (propertyId, userId, rating, comment) VALUES (?, ?, ?, ?)',
      [propertyId, userId, rating, comment]
    );
    return result.insertId;
  },

  getByProperty: async (propertyId) => {
    const [rows] = await db.execute(
      `SELECT r.*, u.name as userName, u.profileImage 
       FROM reviews r 
       JOIN users u ON r.userId = u.id 
       WHERE r.propertyId = ? 
       ORDER BY r.createdAt DESC`,
      [propertyId]
    );
    return rows;
  },

  delete: async (id, userId) => {
    // Users can only delete their own reviews
    await db.execute('DELETE FROM reviews WHERE id = ? AND userId = ?', [id, userId]);
  },

  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propertyId INT NOT NULL,
        userId INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = Review;
