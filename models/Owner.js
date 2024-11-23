const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  address: String,
  ssn: String
});

module.exports = mongoose.model('Owner', ownerSchema);
