const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    // Sprawdzenie, czy użytkownik już istnieje
    let user = await User.findOne({ email });
    if (user) 
      return res.status(400).json({ message: 'User already exists' });

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie nowego użytkownika
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Tworzenie tokena JWT z payloadem (userId i rola)
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Zwracanie tokena oraz danych użytkownika
    res.status(201).json({ token, userId: user._id, role: user.role });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    // Szukanie użytkownika po emailu
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(401).json({ message: 'Invalid credentials' });

    // Porównanie hasła podanego z hasłem w bazie
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(401).json({ message: 'Invalid credentials' });

    // Tworzenie tokena JWT
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, userId: user._id, role: user.role });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
