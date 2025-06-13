const Car = require('../models/Car');

exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err.message);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
};

exports.createCar = async (req, res) => {
  const { brand, model, year, pricePerDay, imageUrl } = req.body;

  // Tworzenie nowego samochodu, ustawiamy dostępność na true domyślnie
  const car = new Car({ 
    brand, 
    model, 
    year, 
    pricePerDay, 
    available: true, 
    imageUrl: imageUrl || '' 
  });

  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (err) {
    console.error('Error creating car:', err.message);
    res.status(400).json({ message: 'Invalid data or server error' });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    console.error('Error updating car:', err.message);
    res.status(400).json({ message: 'Invalid data or server error' });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Error deleting car:', err.message);
    res.status(500).json({ message: 'Server error while deleting car' });
  }
};
