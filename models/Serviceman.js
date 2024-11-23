const mongoose = require('mongoose');

const servicemanSchema = new mongoose.Schema({
  name: String,
  occupation: String,
  address: String,
  experience: String,
  pincode:String,
  description: String,
  phoneNumber:Number,
  email:String,
  lat:String,
  lng:String
});

module.exports = mongoose.model('Serviceman', servicemanSchema);
