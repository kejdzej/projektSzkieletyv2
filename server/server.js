require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Inicjalizacja aplikacji Express
const app = express();
const port = 5001; // Port, na którym działa serwer

// Middleware do obsługi JSON i CORS
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Pozwala na żądania z lokalnego klienta

// Połączenie z bazą danych MongoDB
mongoose.connect('mongodb://localhost:27017/car-rental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB')) 
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Wyłączenie serwera w przypadku błędu
  });

// Importowanie modeli
const User = require('./models/User');
const Car = require('./models/Car');
const Reservation = require('./models/Reservation');

// Middleware autoryzacji z tokenem JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Pobranie nagłówka autoryzacji
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or wrong format' }); // Brak tokenu
  }
  const token = authHeader.split(' ')[1]; // Wyodrębnienie tokenu
  console.log('Received token:', token); // Logowanie otrzymanego tokenu
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // Weryfikacja tokenu
    if (err) {
      console.log('JWT Verification Error:', err.message); // Błąd weryfikacji
      return res.status(401).json({ message: 'Nieprawidłowy token' }); // Nieprawidłowy token
    }
    req.user = decoded; // Przypisanie zdekodowanych danych użytkownika
    console.log('User authenticated:', req.user); // Logowanie udanej autoryzacji
    next(); // Przejście do następnego middleware
  });
};

// Importowanie routów
const carRoutes = require('./routes/cars'); // Routy dla samochodów
const reservationRoutes = require('./routes/reservations'); // Routy dla rezerwacji
const authRoutes = require('./routes/auth'); // Routy dla autoryzacji

// Mapowanie routów
app.use('/api/cars', carRoutes); // Ustawienie routów dla /api/cars
app.use('/api/reservations', reservationRoutes); // Ustawienie routów dla /api/reservations
app.use('/api/auth', authRoutes); // Ustawienie routów dla /api/auth

// Endpoint logowania
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Pobranie danych z żądania
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' }); // Walidacja pól
    }
    const user = await User.findOne({ email }); // Wyszukanie użytkownika
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Nieprawidłowe dane logowania
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' }); // Generowanie tokenu
    res.json({ token, role: user.role }); // Zwrot tokenu i roli
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Obsługa błędów serwera
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Potwierdzenie uruchomienia
});