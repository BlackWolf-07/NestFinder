const db = require('./src/config/db');
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const Booking = require('./src/models/Booking');
const Favorite = require('./src/models/Favorite');
const Review = require('./src/models/Review');
const Report = require('./src/models/Report');

const migrate = async () => {
  try {
    console.log('🚀 Starting Full Production Migration...');

    console.log('👤 Initializing Users table...');
    await User.initTable();

    console.log('🏠 Initializing Properties table...');
    await Property.initTable();

    console.log('📅 Initializing Bookings table...');
    await Booking.initTable();

    console.log('❤️ Initializing Favorites table...');
    await Favorite.initTable();

    console.log('⭐ Initializing Reviews table...');
    await Review.initTable();

    console.log('🚩 Initializing Reports table...');
    await Report.initTable();

    // Secondary migrations (ensuring columns exist if tables were pre-existing)
    console.log('🔧 Running schema integrity checks...');
    try {
      await db.execute('ALTER TABLE properties ADD COLUMN neighborhood JSON AFTER images');
      console.log('✅ Added neighborhood column');
    } catch (e) {}
    
    try {
      await db.execute('ALTER TABLE properties ADD COLUMN isVerified BOOLEAN DEFAULT FALSE AFTER neighborhood');
      console.log('✅ Added isVerified column');
    } catch (e) {}
    
    try {
      await db.execute("ALTER TABLE properties ADD COLUMN approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER isVerified");
      console.log('✅ Added approvalStatus column');
    } catch (e) {}

    console.log('✨ Migration completed successfully. NestFinder is ready for production.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
