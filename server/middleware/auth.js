const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Brak tokenu, autoryzacja niedozwolona' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role }; // Upewnij się, że userId jest dostępne
    console.log('Decoded user:', req.user);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};