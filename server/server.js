require('dotenv').config(); // Wczytaj zmienne z .env
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Zezwól na żądania z localhost:3000

mongoose.connect('mongodb://localhost:27017/car-rental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');
const Car = require('./models/Car');
const Reservation = require('./models/Reservation');

// Middleware autoryzacji z debugowaniem
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Received token:', token); // Debug
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT Verification Error:', err.message); // Debug
      return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
    req.user = decoded;
    console.log('User authenticated:', req.user); // Debug
    next();
  });
};

// Import routów
const carRoutes = require('./routes/cars');
app.use('/api/cars', carRoutes);

// Pozostałe endpointy
app.get('/api/reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.userId });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/reservations/all', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/reservations/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/reservations', authMiddleware, async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const reservation = new Reservation({ carId, userId: req.user.userId, startDate, endDate });
    await reservation.save();
    res.status(201).json({ message: 'Reservation created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});