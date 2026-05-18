const db = require('../config/db');

const Favorite = {
  add: async (userId, propertyId) => {
    await db.execute(
      'INSERT IGNORE INTO favorites (userId, propertyId) VALUES (?, ?)',
      [userId, propertyId]
    );
  },

  remove: async (userId, propertyId) => {
    await db.execute(
      'DELETE FROM favorites WHERE userId = ? AND propertyId = ?',
      [userId, propertyId]
    );
  },

  getByUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT p.* FROM properties p 
       JOIN favorites f ON p.id = f.propertyId 
       WHERE f.userId = ?`,
      [userId]
    );
    return rows;
  },

  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS favorites (
        userId INT NOT NULL,
        propertyId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, propertyId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = Favorite;
