const db = require('../config/db');

const Report = {
  create: async (reportData) => {
    const { propertyId, userId, reason } = reportData;
    const [result] = await db.execute(
      'INSERT INTO reports (propertyId, userId, reason) VALUES (?, ?, ?)',
      [propertyId, userId, reason]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.execute(
      `SELECT r.*, p.title as propertyTitle, u.name as userName 
       FROM reports r 
       JOIN properties p ON r.propertyId = p.id 
       JOIN users u ON r.userId = u.id 
       ORDER BY r.createdAt DESC`
    );
    return rows;
  },

  updateStatus: async (id, status) => {
    await db.execute('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
  },

  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propertyId INT NOT NULL,
        userId INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'resolved') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = Report;
