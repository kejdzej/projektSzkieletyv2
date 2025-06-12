const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date,
  insurance: { type: Boolean, default: false }, // Dodatkowe ubezpieczenie
  trailer: { type: Boolean, default: false },  // Przyczepka
  offsiteDropoff: { type: Boolean, default: false }, // Zostawienie w innym miejscu
  totalCost: { type: Number, default: 0 },     // Całkowity koszt
});

module.exports = mongoose.model('Reservation', reservationSchema);