const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model('Reservation', reservationSchema);