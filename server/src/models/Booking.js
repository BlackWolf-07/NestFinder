const db = require('../config/db');

const Booking = {
  create: async (bookingData) => {
    const { userId, propertyId, ownerId, visitDate, visitTime } = bookingData;
    const [result] = await db.execute(
      'INSERT INTO bookings (userId, propertyId, ownerId, visitDate, visitTime) VALUES (?, ?, ?, ?, ?)',
      [userId, propertyId, ownerId, visitDate, visitTime]
    );
    return result.insertId;
  },

  getByUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT b.*, p.title, p.location, p.city, p.images, u.name as ownerName 
       FROM bookings b 
       JOIN properties p ON b.propertyId = p.id 
       JOIN users u ON b.ownerId = u.id
       WHERE b.userId = ?`,
      [userId]
    );
    return rows;
  },

  getByOwner: async (ownerId) => {
    const [rows] = await db.execute(
      `SELECT b.*, p.title, p.images, u.name as userName, u.phone as userPhone, u.email as userEmail
       FROM bookings b 
       JOIN properties p ON b.propertyId = p.id 
       JOIN users u ON b.userId = u.id
       WHERE b.ownerId = ?`,
      [ownerId]
    );
    return rows;
  },

  updateStatus: async (id, status) => {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  },

  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        propertyId INT NOT NULL,
        ownerId INT NOT NULL,
        visitDate DATE NOT NULL,
        visitTime TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await db.execute(query);
  }
};

module.exports = Booking;
