const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Car = require('../models/Car');
const authMiddleware = require('../middleware/auth');

// Pobranie rezerwacji użytkownika
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.userId })
      .populate('carId', 'brand model pricePerDay');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Pobranie wszystkich rezerwacji (admin)
router.get('/all', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const reservations = await Reservation.find()
      .populate('carId', 'brand model pricePerDay');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Tworzenie nowej rezerwacji
router.post('/', authMiddleware, async (req, res) => {
  try {
    const reservationData = req.body;

    const car = await Car.findById(reservationData.carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const start = new Date(reservationData.startDate);
    const end = new Date(reservationData.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const baseCost = days * car.pricePerDay;
    const extraCosts = [
      reservationData.insurance ? 50 : 0,
      reservationData.trailer ? 100 : 0,
      reservationData.offsiteDropoff ? 200 : 0,
    ];
    const totalCost = baseCost + extraCosts.reduce((a, b) => a + b, 0);

    const reservation = await Reservation.create({
      carId: reservationData.carId,
      userId: req.user.userId,
      startDate: start,
      endDate: end,
      insurance: reservationData.insurance === true,
      trailer: reservationData.trailer === true,
      offsiteDropoff: reservationData.offsiteDropoff === true,
      totalCost: totalCost,
    });

    await Car.findByIdAndUpdate(reservationData.carId, { available: false });

    res.status(201).json({ message: 'Reservation created', reservation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    console.log('Reservation found:', reservation);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (!reservation.userId || reservation.userId.toString() !== req.user.userId) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await reservation.deleteOne();

    if (reservation.carId) {
      await Car.findByIdAndUpdate(reservation.carId, { available: true });
    }

    res.json({ message: 'Reservation canceled' });
  } catch (err) {
    console.error('Error in DELETE /reservations/:id:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});




module.exports = router;
