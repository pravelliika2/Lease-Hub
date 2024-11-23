const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  type: { 
    type: String,
    required: false, 
    enum: ['buy', 'rent', 'sharedaccommodation', 'serviceapartments', 'commercial', 'specific']
  },
  username: {
    type: String,
    required: true // or false, depending on your requirements
  },
  vacancy: {
          type: Boolean,
          default: false,
      },
  // tenantUsername: {
  //   type: String,
  //   required: false // Set to true if it should be required
  // },
  tenantUsername:String,
  proprtyImage: String,
  price: Number,
  bedrooms: Number,
  bathrooms: Number,
  houseType: String,
  lat: String,
  lng: String,
  parkingSpace: Number,
  basement: String, 
  flooring: String,
  heating: String,
  cooling: String,
  interiorLivableArea: Number,
  squareFeet: Number,
  architecturalStyle: String,
  constructionMaterial: String,
  foundation: String,
  yearOfConstruction: Number,
  address: String,
  zipCode: Number,
  minDuration: String,
   maxDuration: String,
 
  description: String,
  // imageUrl: String, // Added field for image URL
  utilities: {
    electricity: {
      type: Boolean,
      default: false, // Assuming a default value of false if not specified
    },
    water: {
      type: Boolean,
      default: false, // Assuming a default value of false if not specified
    },
    // Add more utility options as needed
  },
  leaseDuration: {
    '6months': {
      type: Boolean,
      default: false,
    },
    '1year': {
      type: Boolean,
      default: false,
    },
    // Add more lease duration options as needed
  },
 
  amenities: {
    ac: {
      type: Boolean,
      default: false,
    },
    dryer: {
      type: Boolean,
      default: false,
    },
    // Add more utility options as needed
    refrigerator: {
      type: Boolean,
      default: false,
    },
    washingMachine: {
      type: Boolean,
      default: false,
    },
    microwave: {
      type: Boolean,
      default: false,
    },
    other: {
      type: Boolean,
      default: false,
    },
    otherDescription: {
      type: String,
      default: '',
    },
    
  },
  nearBy: {
    schools: {
      type: Boolean,
      default: false,
    },
    policestations: {
      type: Boolean,
      default: false,
    },
    // Add more utility options as needed
    gasstations: {
      type: Boolean,
      default: false,
    },
    firestations: {
      type: Boolean,
      default: false,
    },
    hospitals: {
      type: Boolean,
      default: false,
    },
    other: {
      type: Boolean,
      default: false,
    },
    otherDescription: {
      type: String,
      default: '',
    },
    
  },
   
  image: {
    data: Buffer,
    contentType: String
  },
  roomates: String,
 });
const Property = mongoose.model('Property', propertySchema);
module.exports = Property;

