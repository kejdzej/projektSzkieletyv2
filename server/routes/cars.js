const express = require('express');
const { check } = require('express-validator');
const carController = require('../controllers/carController'); // Upewnij się, że istnieje
const auth = require('../middleware/auth');
const Car = require('../models/Car'); // Upewnij się, że ścieżka jest poprawna
const admin = require('../middleware/admin');
const mongoose = require('mongoose'); // Dodano dla ObjectId.isValid

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('Fetching cars...'); // Debug
    const cars = await Car.find();
    console.log('Cars fetched:', cars); // Debug
    res.json(cars);
  } catch (err) {
    console.error('Error in /api/cars:', err); // Debug
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching car with id:', req.params.id); // Debug
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid car ID format' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) {
      console.log('Car not found with id:', req.params.id);
      return res.status(404).json({ message: 'Car not found' });
    }
    console.log('Car fetched successfully:', car);
    res.json(car);
  } catch (err) {
    console.error('Error fetching car:', err.stack); // Pełny stack trace
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post(
  '/',
  [
    auth,
    admin,
    check('brand', 'Brand is required').not().isEmpty(),
    check('model', 'Model is required').not().isEmpty(),
    check('year', 'Year is required').isInt({ min: 1900 }),
    check('pricePerDay', 'Price per day is required').isFloat({ min: 0 }),
  ],
  carController.createCar
);

router.put(
  '/:id',
  [
    auth,
    admin,
    check('brand', 'Brand is required').not().isEmpty(),
    check('model', 'Model is required').not().isEmpty(),
    check('year', 'Year is required').isInt({ min: 1900 }),
    check('pricePerDay', 'Price per day is required').isFloat({ min: 0 }),
  ],
  carController.updateCar
);

router.delete('/:id', [auth, admin], carController.deleteCar);

// PATCH /api/cars/:id/availability
router.patch('/:id/availability', [auth, admin], async (req, res) => {
  const carId = req.params.id;
  const { available } = req.body;

  if (typeof available !== 'boolean') {
    return res.status(400).json({ message: 'Pole available musi być typu boolean' });
  }

  try {
    const updatedCar = await Car.findByIdAndUpdate(carId, { available }, { new: true });
    if (!updatedCar) {
      return res.status(404).json({ message: 'Auto nie znalezione' });
    }

    if (available === true) {
      await Reservation.deleteMany({ carId: carId }); // Usuń wszystkie rezerwacje dla tego auta
    }

    res.json({ message: 'Auto zaktualizowane', car: updatedCar });
  } catch (err) {
    console.error('Błąd w PATCH /api/cars/:id/availability:', err);
    res.status(500).json({ message: 'Błąd serwera podczas aktualizacji auta' });
  }
});

// DELETE /api/cars/:id/reservations/:reservationId
router.delete('/reservations/:reservationId', [auth, admin], async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    const car = await Car.findById(reservation.carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    await Reservation.findByIdAndDelete(req.params.reservationId);
    car.available = true;
    await car.save();

    res.json({ message: 'Reservation canceled, car available', car });
  } catch (err) {
    console.error('Error canceling reservation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;