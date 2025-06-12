require('dotenv').config(); // Wczytaj zmienne z .env
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

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
  console.log('Received token:', token);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT Verification Error:', err.message);
      return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
    req.user = decoded;
    console.log('User authenticated:', req.user);
    next();
  });
};

// Import i rejestracja routów
const carRoutes = require('./routes/cars');
const reservationRoutes = require('./routes/reservations');

app.use('/api/cars', carRoutes);
app.use('/api/reservations', reservationRoutes);

// Endpointy autoryzacji
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

// Start serwera
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
