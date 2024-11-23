const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  isOpen: { type: Boolean, required: true },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property' // Ensure this matches your Property model name
  }
});

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;
