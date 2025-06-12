const Reservation = require('../models/Reservation');
const Car = require('../models/Car');
const { validationResult } = require('express-validator');

exports.createReservation = async (req, res) => {
  console.log('createReservation called');
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { carId, startDate, endDate } = req.body;

  try {
    console.log('Finding car with id:', carId);
    const car = await Car.findById(carId);
    if (!car) {
      console.log('Car not found');
      return res.status(400).json({ message: 'Car not found' });
    }
    if (!car.available) {
      console.log('Car not available');
      return res.status(400).json({ message: 'Car not available' });
    }

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24);
    console.log('Calculated days:', days);

    if (days <= 0) {
      console.log('Invalid date range');
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const totalPrice = days * car.pricePerDay;
    console.log('Total price:', totalPrice);

    const reservation = new Reservation({
      userId: req.user.userId,
      carId: car._id,
      startDate,
      endDate,
      totalPrice,
      status: 'active'
    });

    console.log('Saving reservation:', reservation);
    await reservation.save();
    car.available = false;
    console.log('Updating car availability:', car._id);
    await car.save();

    res.status(201).json(reservation);
  } catch (err) {
    console.error('Server error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.userId }).populate('carId', 'brand model');
    console.log('Fetched reservations:', reservations);
    res.json(reservations);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};