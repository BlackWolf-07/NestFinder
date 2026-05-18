const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { generateRentalAgreement } = require('../services/pdfService');

exports.createBooking = async (req, res) => {
  try {
    const property = await Property.getById(req.body.propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const bookingId = await Booking.create({
      userId: req.user.id,
      propertyId: property.id,
      ownerId: property.ownerId,
      visitDate: req.body.visitDate,
      visitTime: req.body.visitTime
    });

    res.status(201).json({ message: 'Visit scheduled successfully', bookingId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule visit' });
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
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    await Booking.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.downloadAgreement = async (req, res) => {
  try {
    const booking = await Booking.getByUser(req.user.id).then(rows => rows.find(r => r.id === parseInt(req.params.id)));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

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
    res.status(500).json({ error: 'Failed to generate agreement' });
  }
};
