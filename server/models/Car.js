const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  year: Number,
  pricePerDay: Number,
  available: Boolean,
  imageUrl: String,
});

module.exports = mongoose.model('Car', carSchema);