const mongoose = require('mongoose');

// Assuming you have User and Property models defined somewhere like this:
// const User = require('./User');
// const Property = require('./Property');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should match the name of your user model
    required: true
  },
  username: { // New field to store the username
    type: String,
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property', // This should match the name of your property model
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;

// const getWishlistStatus = async (userId) => {
//   const wishlistItems = await Wishlist.find({ user: userId }).select('property');
//   return wishlistItems.map(item => item.property.toString());
// };

// module.exports = { Wishlist, getWishlistStatus };
