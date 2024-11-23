const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  lat: { type: String, required: true },
  lng: { type: String, required: true },
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);
module.exports = Vacancy;
