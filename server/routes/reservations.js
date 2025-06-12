const express = require('express');
const { check, validationResult } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

const router = express.Router();

router.post(
  '/',
  [
    auth,
    check('carId', 'Car ID is required').isMongoId(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('Auth user:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication failed, userId missing' });
    }
    next();
  },
  reservationController.createReservation
);

router.get('/', auth, reservationController.getUserReservations);

router.get('/all', [auth, admin], async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('carId', 'brand model');
    console.log('All reservations for admin:', reservations);
    res.json(reservations);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/reservations/:id', [auth, admin], async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    const car = await Car.findById(reservation.carId);
    if (car) {
      car.available = true;
      await car.save();
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation canceled successfully' });
  } catch (err) {
    console.error('Error canceling reservation:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;