const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  address: String,
  ssn: String,
  pincode:String,
  occupation: String
});

module.exports = mongoose.model('Service', serviceSchema);


