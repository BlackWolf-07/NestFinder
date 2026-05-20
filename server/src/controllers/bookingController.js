const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { generateRentalAgreement } = require('../services/pdfService');

exports.createBooking = async (req, res) => {
  try {
    const property = await Property.getById(req.body.propertyId);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

    const bookingId = await Booking.create({
      userId: req.user.id,
      propertyId: property.id,
      ownerId: property.ownerId,
      visitDate: req.body.visitDate,
      visitTime: req.body.visitTime
    });

    res.status(201).json({ success: true, message: 'Visit scheduled successfully', bookingId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to schedule visit' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'owner') {
      bookings = await Booking.getByOwner(req.user.id);
    } else {
      bookings = await Booking.getByUser(req.user.id);
    }

    const formattedBookings = bookings.map(booking => {
      let propertyImage = null;
      if (booking.images) {
        try {
          const imgs = typeof booking.images === 'string' ? JSON.parse(booking.images) : booking.images;
          propertyImage = imgs[0] || null;
        } catch (e) {
          console.error("Image parsing failed in booking controller", e);
        }
      }
      return { ...booking, propertyImage, propertyTitle: booking.title };
    });

    res.json({ success: true, bookings: formattedBookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    await Booking.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Update failed' });
  }
};

exports.downloadAgreement = async (req, res) => {
  try {
    const bookings = await (req.user.role === 'owner' ? Booking.getByOwner(req.user.id) : Booking.getByUser(req.user.id));
    const booking = bookings.find(r => r.id === parseInt(req.params.id));
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const property = await Property.getById(booking.propertyId);
    const owner = await User.findById(booking.ownerId);

    const agreementData = {
      ownerName: owner.name,
      renterName: req.user.name,
      renterEmail: req.user.email,
      propertyTitle: property.title,
      propertyAddress: property.location,
      city: property.city,
      rentAmount: property.price
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Agreement_${booking.id}.pdf`);

    generateRentalAgreement(res, agreementData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate agreement' });
  }
};



