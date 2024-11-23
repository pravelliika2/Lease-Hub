const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://saisree1kbf171:TP0OM24yCw4hKji0@cluster0.bdkgly5.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// User, Owner, and Service Models
const User = require('./models/User'); // Update this model as needed
const Owner = require('./models/Owner'); // Create this model
const Service = require('./models/Service'); // Create this model
const Serviceman = require('./models/Serviceman');
const Property = require('./models/Property'); // Import the Property model
const Vacancy = require('./models/Vacancy');
const Issue = require('./models/Issue');
const Document = require('./models/Document');
const Wishlist = require('./models/Wishlist'); // Replace with your actual Wishlist model
// const { getWishlistStatus } = require('./models/Wishlist');
const Notification = require('./models/Notification');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this uploads directory exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({ storage: multer.memoryStorage() });

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    return res.sendStatus(401);
  }

  // Use the same environment variable for the JWT secret key
  const secretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}


app.post('/signup/user', async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        phone: req.body.phone
      });
      await user.save();
      res.status(201).json({ message: 'User signup successful' });
  } catch (error) {
      console.error('Signup error:', error); // Log the entire error
      res.status(500).json({ message: 'User signup failed', error: error.message });
  }
});

app.post('/signup/owner', async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newOwner = new Owner({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        ssn: req.body.ssn

      });
      await newOwner.save();
      res.status(201).json({ message: 'Owner signup successful' });
  } catch (error) {
      res.status(500).json({ message: 'Error in owner signup', error: error.message });
  }
});



app.post('/signup/service', async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newService = new Service({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        ssn: req.body.ssn,
        occupation: req.body.occupation
      });
      await newService.save();
      res.status(201).json({ message: 'Service provider signup successful' });
  } catch (error) {
      res.status(500).json({ message: 'Error in service provider signup', error: error.message });
  }
});


app.post('/servicemanadd', async (req, res) => {
  // Similar to the User login route
  try {
    const serviceman = new Serviceman({
      name: req.body.name,
      occupation: req.body.occupation,
      address: req.body.address,
      experience: req.body.experience,
      description: req.body.description,
      pincode:req.body.pincode,
      phoneNumber:req.body.phoneNumber,
      email:req.body.email,
      lat: req.body.lat,
      lng: req.body.lng
    });
    await serviceman.save();
    // console.log(serviceman)
    res.status(200).json({ message: 'Service added successfully', serviceman: serviceman });
  } catch (error) {
    console.error('Add service error:', error); // Log the entire error
    res.status(500).json({ message: 'Error adding service', error: error.message });
  }
});


app.get('/properties', async (req, res) => {
  const { type } = req.query;
  try {
    const properties = await Property.find({ type: type });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});
app.get('/properties', async (req, res) => {
  const { type } = req.query;
  try {
    const properties = await Property.find({ type: type });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

app.get('/properties/:id1/:id2', async (req, res) => {
  const { id1, id2 } = req.params;
  try {
    const property = await Property.find({ _id: { $in: [id1, id2] } });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property details', error: error.message });
  }
});

app.get('/serviceMan', async (req, res) => {
  try {
    const result = await Serviceman.find();
    res.json(result);
  } catch (error) {
    console.error('Error fetching service men:', error);
    res.status(500).json({ message: 'Error fetching service men', error: error.message });
  }
});

app.get('/serviceMan', async (req, res) => {
  try {
    const result = await Serviceman.find();
    res.json(result);
  } catch (error) {
    console.error('Error fetching service men:', error);
    res.status(500).json({ message: 'Error fetching service men', error: error.message });
  }
});

app.get('/similarProperties/:propertyId', async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const originalProperty = await Property.findById(propertyId);

    if (!originalProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const similarProperties = await Property.find({
      _id: originalProperty._id,
      // bedrooms: originalProperty.bedrooms,
      // bathrooms: originalProperty.bathrooms,
      // houseType: originalProperty.houseType,
      // parkingSpace: originalProperty.parkingSpace,
      // yearOfBuilding: originalProperty.yearOfBuilding,
    }).limit(5);

    const filteredSimilarProperties = similarProperties.filter(
      (property) => property._id.toString() !== originalProperty._id.toString()
    );
    const finalSimilarProperties = [originalProperty, ...filteredSimilarProperties];

    res.json(finalSimilarProperties);
    //res.json(similarProperties);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/annual-income/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const properties = await Property.find({ type });
    const annualIncome = properties.reduce((total, property) => total + property.price * 12, 0);

    res.json({ annualIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/vacancies/create', async (req, res) => {
  try {
    const newVacancy = await Vacancy.create(req.body);
    res.status(201).json(newVacancy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/vacancies/getAll', async (req, res) => {
  try {
    const vacancies = await Vacancy.find();
    res.status(200).json(vacancies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/create/issues', async (req, res) => {
  try {
    const { type, description, propertyId } = req.body;
    console.log('Received issue data:', { type, description, propertyId }); // Log the received data

    const newIssue = new Issue({ type, description, isOpen: true, property: propertyId });
    await newIssue.save();
    console.log('Saved new issue:', newIssue); // Log the saved issue

    res.json(newIssue);
  } catch (error) {
    console.error('Error in POST /create/issues:', error); // Log error details
    res.status(500).send('Internal Server Error');
  }
});


app.put('/update/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    console.log('Found issue for update:', issue); // Log the found issue for update

    issue.isOpen = false;
    await issue.save();
    console.log('Updated issue:', issue); // Log the updated issue

    res.json(issue);
  } catch (error) {
    console.error('Error in PUT /update/issues/:id:', error); // Log error details
    res.status(500).send('Internal Server Error');
  } 
});


app.get('/allavaiproperties', async (req, res) => {
  try {
    const availableProperties = await Property.find({ isAvailable: true, type: "buy" });
    res.json(availableProperties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching available property details', error: error.message });
  }
});

app.post('/properties/upload-document', upload.single('document'), async (req, res) => {
  try {
    const { propertyId, username } = req.body;

    const document = new Document({
      property: propertyId,
      username,
      documentPath: req.file ? req.file.path.replace(/\\/g, '/') : undefined,
    });
    await document.save();
    res.status(201).json({ message: 'doc added successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});


app.get('/get-tenant-properties/:tenantUsername', async (req, res) => {
  try {
    const tenantUsername = req.params.tenantUsername;
    const properties = await Property.find({ tenantUsername: tenantUsername });
    console.log('Fetched properties for tenant:', properties); // Log the fetched properties

    res.json({ properties });
  } catch (error) {
    console.error('Error in GET /get-tenant-properties/:tenantUsername:', error); // Log error details
    res.status(500).send('Internal Server Error');
  }
});


app.get('/all-doc', async (req, res) => {
  try {
    // const documents = await Document.find().populate('property', ['username', 'documentPath']);
    const documents = await Document.find().populate('property');
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const jwt = require('jsonwebtoken');

app.post('/login/user', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ id: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
      res.status(200).json({ token, message: 'User login successful' });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Owner Login Route
app.post('/login/owner', async (req, res) => {
  try {
      const { username, password } = req.body;
      const owner = await Owner.findOne({ username });

      if (!owner) {
          return res.status(400).json({ message: 'Owner not found' });
      }

      const isMatch = await bcrypt.compare(password, owner.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ id: owner._id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
      res.status(200).json({ token, message: 'Owner login successful' });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


app.post('/login/service', async (req, res) => {
  try {
      const { username, password } = req.body;
      const service = await Service.findOne({ username });

      if (!service) {
          return res.status(400).json({ message: 'Service provider not found' });
      }

      const isMatch = await bcrypt.compare(password, service.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
      }

      // Use an environment variable for the JWT secret key
      const secretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';
      const token = jwt.sign({ id: service._id }, secretKey, { expiresIn: '1h' });

      res.status(200).json({ token, message: 'Service provider login successful' });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.post('/add-property', async (req, res) => {
  try {
    const {
      username,
      type,
      price,
      bedrooms,
      bathrooms,
      houseType,
      parkingSpace,
      lat,
      lng,
      basement, 
      flooring,
      heating,
      cooling,
      interiorLivableArea,squareFeet,
      architecturalStyle,constructionMaterial,foundation,yearOfConstruction,
      field2,
      // image, 
      
      description,
      utilities,
      amenities,
      leaseDuration,
      roomates,
      zipCode,
      nearBy,
      minDuration,
      maxDuration,
      
      
    } = req.body;

    // let imagePath;
    // if (req.file) {
    //   imagePath = req.file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for compatibility
    // }
    console.log("Received username:", username); // Debugging log

    const property = new Property({
      // ownerName: username,
      username: req.body.username,
      type,
      price,
      bedrooms,
      bathrooms,
      houseType,
      parkingSpace,
      lat,
      lng,
      basement,
      flooring,
      heating,
      cooling,interiorLivableArea,squareFeet,
      architecturalStyle,
      constructionMaterial,foundation,yearOfConstruction,
      field2,
      // image,
     
      description,
     utilities,
     amenities,
     leaseDuration,
     roomates,
     zipCode,
      nearBy,
      minDuration,
      maxDuration,
    });

    await property.save();
    res.status(201).json({ message: 'Property added successfully', property: property });
  } catch (error) {
    console.error('Add property error:', error);
    res.status(500).json({ message: 'Error adding property', error: error.message });
  }
});

app.get('/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property details', error: error.message });
  }
});

app.get('/get-properties', async (req, res) => {
  try {
    const properties = await Property.find(); // Retrieve all properties from the database

    res.status(200).json({ properties });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

app.get('/getOwners', async (req, res) => {
  try {
    const owners = await Owner.find();

    res.status(200).json({ owners });
  } catch (error) {
    console.error('Fetch owners error:', error);
    res.status(500).json({ message: 'Error fetching owners', error: error.message });
  }
});
// app.put('/edit-property/:propertyId', async (req, res) => {
//   const { propertyId } = req.params; // Get the property ID from the request parameters

//   try {
//     const {
//       type,
//       bedrooms,
//       lat,
//       lng,
//       // Add other fields that you want to update
//     } = req.body;

//     // Find the property by ID and update its details
//     const updatedProperty = await Property.findByIdAndUpdate(propertyId, {
//       type,
//       bedrooms,
//       lat,
//       lng,
//       // Add other fields that you want to update
//     }, { new: true }); // { new: true } returns the updated property instead of the original one

//     if (!updatedProperty) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
//   } catch (error) {
//     console.error('Edit property error:', error);
//     res.status(500).json({ message: 'Error editing property', error: error.message });
//   }
// });

// app.put('/edit-property/:propertyId', async (req, res) => {
//   const { propertyId } = req.params;
//   const updates = req.body;

//   try {
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     // Check if the price has changed
//     if (updates.price && property.price !== updates.price) {
//       property.oldPrice = property.price;
//       // Create a notification for all users who have this property in their wishlist
//       const usersWithPropertyInWishlist = await Wishlist.find({ property: propertyId });
//       usersWithPropertyInWishlist.forEach(async (wishlistItem) => {
//         const notification = new Notification({
//           user: wishlistItem.user,
//           message: `Price updated for property ${property.title}`,
//           property: propertyId
//         });
//         await notification.save();
//       });
//     }

//     // Update the property
//     const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
//     res.json(updatedProperty);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating property data', error: error.message });
//   }
// });


app.get('/get-properties/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const properties = await Property.find({ username: username });
    res.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

app.put('/user/profile', async (req, res) => {
  try {
      const { id, ...updates } = req.body;
      const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Error updating user data', error: error.message });
  }
});

app.put('/user/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Ensure the _id field isn't included in the updates
    delete updates._id;

    // Ensure other unnecessary fields like __v and password aren't included in updates
    delete updates.__v;
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user data', error: error.message });
  }
});

app.get('/user/profile/:username', async (req, res) => {
  // app.get('/user/profile/:username', authenticateToken, async (req, res) => {
  try {
      console.log('API Request: Get User Profile');
      const username = req.params.username;
      console.log('Username from params:', username);

      // const user = await User.findOne({ username }).select('-password'); // Exclude password
      const user = await User.findOne({
        username: new RegExp('^' + username + '$', 'i')
      }).select('-password'); // Exclude password from the result
  
      console.log('User found:', user);

      if (!user) {
          console.log('User not found for username:', username);
          return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
  } catch (error) {
      console.error('Error in /user/profile/:username:', error);
      res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  }
});
// app.get('/owner/profile/:username', async (req, res) => {
//   try {
//       console.log('API Request: Get User Profile');
//       const username = req.params.username;
//       console.log('Username from params:', username);

//       // const user = await User.findOne({ username }).select('-password'); // Exclude password
//       const user = await User.findOne({
//         username: new RegExp('^' + username + '$', 'i')
//       }).select('-password'); // Exclude password from the result
  
//       console.log('User found:', user);

//       if (!user) {
//           console.log('User not found for username:', username);
//           return res.status(404).json({ message: 'User not found for username',username });
//       }

//       res.json(user);
//   } catch (error) {
//       console.error('Error in /user/profile/:username:', error);
//       res.status(500).json({ message: 'Error retrieving user data', error: error.message });
//   }
// });
app.get('/owner/profile/:username', async (req, res) => {
  try {
    console.log('API Request: Get User Profile');
    let username = req.params.username;
    console.log('Username from params before trimming:', username);

    // Decode URI component and trim to ensure no extra whitespace or encoded characters
    username = decodeURIComponent(username).trim();
    console.log('Username from params after trimming:', username);

    const user = await User.findOne({
      username: new RegExp('^' + username + '$', 'i')
    }).select('-password'); // Exclude password from the result

    console.log('User found:', user);

    if (!user) {
      console.log('User not found for username:', username);
      return res.status(404).json({ message: 'User not found for username', username });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /user/profile/:username:', error);
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  }
});


// app.get('/user/profile/:username', async (req, res) => {
//   try {
//     const { username } = req.params;
//     const user = await User.find({ username: username });
//     // const user = await User.findOne({ username }).select('-password');
//     res.json({ user });
//   } catch (error) {
//     console.error('Error fetching properties:', error);
//     res.status(500).json({ message: 'Error fetching properties', error: error.message });
//   }
// });

async function checkWishlist(userId, propertyId) {
  const wishlistItem = await Wishlist.findOne({
    user: userId,
    property: propertyId
  });
  return !!wishlistItem;
}

// async function getWishlistStatus(username) {
//   const user = await getUserIdByUsername(username);
//   const wishlistItems = await Wishlist.find({ user: userId }).select('property');
//   return wishlistItems.map(item => item.property.toString());
// }

// This function should be declared once and exported if needed elsewhere

async function getWishlistStatus(username) {
  const user = await User.findOne({ username: new RegExp(`^${username.trim().toLowerCase()}$`, 'i') });
  if (!user) {
    throw new Error('User not found');
  }
  const wishlistItems = await Wishlist.find({ user: user._id }).select('property');
  return wishlistItems.map(item => item.property.toString());
}

// Removes a property from the user's wishlist
async function removeFromWishlist(userId, propertyId) {
  const result = await Wishlist.deleteOne({
    user: userId,
    property: propertyId
  });
  return result.deletedCount > 0;
}

// Adds a property to the user's wishlist
async function addToWishlist(userId, propertyId) {
  const newWishlistItem = new Wishlist({
    user: userId,
    property: propertyId
  });
  await newWishlistItem.save();
  return newWishlistItem;
}

module.exports = {
  checkWishlist,
  removeFromWishlist,
  addToWishlist,
  getWishlistStatus,

};
async function getUserIdByUsername(username) {
  // Replace with your actual database query logic
  try{
  console.log(`Looking up userID for username: ${username}`); // Log before the query
  console.log(`Looking up userID for normalized username: ${username.trim().toLowerCase()}`);

  // const user = await User.findOne({ where: { username: username } });
  // const user = await User.findOne({ username: new RegExp('^' + username.trim().toLowerCase() + '$', 'i') });
  // const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') }); // This makes the search case-insensitive
  const user = await User.findOne({ username: new RegExp(`^${username.trim().toLowerCase()}$`, 'i') });

  console.log('User found:', user);

  // console.log(`Attempting to toggle wishlist for user: ${username} with propertyId: ${property._id}`); // Log the username and propertyId

  // return user ? user._id : null;
  return user ? user._id.toString() : null; // Convert ObjectId to string if user is found

}catch (error) {
  console.error('Error fetching user by username:', error);
  return null; // Or handle the error as appropriate
}
}
//before
// app.post('/wishlist/:propertyId', async (req, res) => {
//   const { userUsername } = req.body;
//   const { propertyId } = req.params;

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     let wishlistItem = await Wishlist.findOne({ user: user._id, property: propertyId });
//     if (wishlistItem) {
//       await Wishlist.deleteOne({ _id: wishlistItem._id });
//       return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
//     } else {
//       wishlistItem = new Wishlist({ user: user._id, property: propertyId });
//       await wishlistItem.save();
//       return res.status(201).json({ success: true, message: 'Property added to wishlist' });
//     }
//   } catch (error) {
//     console.error('Error updating wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error updating wishlist', error: error.toString() });
//   }
// });
//*

// app.post('/wishlist/:propertyId', async (req, res) => {
//   const { userUsername } = req.body;
//   const { propertyId } = req.params;

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     let wishlistItem = await Wishlist.findOne({ user: user._id, property: propertyId });
//     if (wishlistItem) {
//       await Wishlist.deleteOne({ _id: wishlistItem._id });
//       return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
//     } else {
//       wishlistItem = new Wishlist({ user: user._id, username: userUsername.trim().toLowerCase(), property: propertyId }); // Include username
//       await wishlistItem.save();
//       return res.status(201).json({ success: true, message: 'Property added to wishlist' });
//     }
//   } catch (error) {
//     console.error('Error updating wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error updating wishlist', error: error.toString() });
//   }
// });

// app.get('/wishlist/:username', async (req, res) => {
//   const { username } = req.params;

//   try {
//     const wishlistItems = await Wishlist.find({ username: username.toLowerCase() }).select('property');
//     res.json({ success: true, wishlistItems });
//   } catch (error) {
//     console.error('Error fetching wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.toString() });
//   }
// });


// app.delete('/wishlist/:propertyId', async (req, res) => {
//   const { userUsername } = req.body;
//   const { propertyId } = req.params;

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const removed = await Wishlist.deleteOne({ user: user._id, property: propertyId });
//     if (removed.deletedCount > 0) {
//       return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
//     } else {
//       return res.status(400).json({ success: false, message: 'Property not found in wishlist' });
//     }
//   } catch (error) {
//     console.error('Error removing property from wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error removing property from wishlist', error: error.toString() });
//   }
// });

app.post('/wishlist/:propertyId', async (req, res) => {
  const { userUsername } = req.body;
  const { propertyId } = req.params;

  console.log(`POST /wishlist/${propertyId} - Adding or removing a property from wishlist for user: ${userUsername}`);

  try {
    const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found: ${userUsername}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let wishlistItem = await Wishlist.findOne({ user: user._id, property: propertyId });
    if (wishlistItem) {
      console.log(`Removing property ${propertyId} from wishlist for user: ${userUsername}`);
      await Wishlist.deleteOne({ _id: wishlistItem._id });
      return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
    } else {
      console.log(`Adding property ${propertyId} to wishlist for user: ${userUsername}`);
      wishlistItem = new Wishlist({ user: user._id, username: userUsername.trim().toLowerCase(), property: propertyId });
      await wishlistItem.save();
      return res.status(201).json({ success: true, message: 'Property added to wishlist' });
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ success: false, message: 'Error updating wishlist', error: error.toString() });
  }
});

// app.get('/wishlist/:username', async (req, res) => {
//   const { username } = req.params;

//   console.log(`GET /wishlist/${username} - Fetching wishlist for user: ${username}`);

//   try {
//     const wishlistItems = await Wishlist.find({ username: username.toLowerCase() }).select('property');
//     console.log(`Wishlist items found for user ${username}:`, wishlistItems);
//     res.json({ success: true, wishlistItems });
//   } catch (error) {
//     console.error('Error fetching wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.toString() });
//   }
// });

app.delete('/wishlist/:propertyId', async (req, res) => {
  const { userUsername } = req.body;
  const { propertyId } = req.params;

  console.log(`DELETE /wishlist/${propertyId} - Removing property from wishlist for user: ${userUsername}`);

  try {
    const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found: ${userUsername}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const removed = await Wishlist.deleteOne({ user: user._id, property: propertyId });
    if (removed.deletedCount > 0) {
      console.log(`Property ${propertyId} removed from wishlist for user: ${userUsername}`);
      return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
    } else {
      console.log(`Property ${propertyId} not found in wishlist for user: ${userUsername}`);
      return res.status(400).json({ success: false, message: 'Property not found in wishlist' });
    }
  } catch (error) {
    console.error('Error removing property from wishlist:', error);
    res.status(500).json({ success: false, message: 'Error removing property from wishlist', error: error.toString() });
  }
});

app.post('/wishlist/:propertyId', async (req, res) => {
  const { userUsername } = req.body;
  const { propertyId } = req.params;

  console.log(`POST /wishlist/${propertyId} - Adding or removing a property from wishlist for user: ${userUsername}`);

  try {
    const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found: ${userUsername}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let wishlistItem = await Wishlist.findOne({ user: user._id, property: propertyId });
    if (wishlistItem) {
      console.log(`Removing property ${propertyId} from wishlist for user: ${userUsername}`);
      await Wishlist.deleteOne({ _id: wishlistItem._id });
      return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
    } else {
      console.log(`Adding property ${propertyId} to wishlist for user: ${userUsername}`);
      wishlistItem = new Wishlist({ user: user._id, username: userUsername.trim().toLowerCase(), property: propertyId });
      await wishlistItem.save();
      return res.status(201).json({ success: true, message: 'Property added to wishlist' });
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ success: false, message: 'Error updating wishlist', error: error.toString() });
  }
});

// app.get('/wishlist/:username', async (req, res) => {
//   const { username } = req.params;

//   console.log(`GET /wishlist/${username} - Fetching wishlist for user: ${username}`);

//   try {
//     const wishlistItems = await Wishlist.find({ username: username.toLowerCase() }).select('property');
//     console.log(`Wishlist items found for user ${username}:`, wishlistItems);
//     res.json({ success: true, wishlistItems });
//   } catch (error) {
//     console.error('Error fetching wishlist:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.toString() });
//   }
// });

app.delete('/wishlist/:propertyId', async (req, res) => {
  const { userUsername } = req.body;
  const { propertyId } = req.params;

  console.log(`DELETE /wishlist/${propertyId} - Removing property from wishlist for user: ${userUsername}`);

  try {
    const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found: ${userUsername}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const removed = await Wishlist.deleteOne({ user: user._id, property: propertyId });
    if (removed.deletedCount > 0) {
      console.log(`Property ${propertyId} removed from wishlist for user: ${userUsername}`);
      return res.status(200).json({ success: true, message: 'Property removed from wishlist' });
    } else {
      console.log(`Property ${propertyId} not found in wishlist for user: ${userUsername}`);
      return res.status(400).json({ success: false, message: 'Property not found in wishlist' });
    }
  } catch (error) {
    console.error('Error removing property from wishlist:', error);
    res.status(500).json({ success: false, message: 'Error removing property from wishlist', error: error.toString() });
  }
});


// app.get('/wishlist/status', async (req, res) => {
//   const { userUsername } = req.query;

//   console.log(`GET /wishlist/status - Fetching wishlist status for user: ${userUsername}`);

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       console.log(`User not found: ${userUsername}`);
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     console.log(`User found: ${userUsername}, User ID: ${user._id}`);

//     const wishlistItems = await Wishlist.find({ user: user._id }).select('property');
//     console.log(`Wishlist items found for user ${userUsername}:`, wishlistItems);

//     const wishlistStatus = wishlistItems.map(item => item.property.toString());
//     console.log(`Wishlist status for user ${userUsername}:`, wishlistStatus);

//     res.status(200).json({ success: true, wishlistStatus });
//   } catch (error) {
//     console.error('Error fetching wishlist status:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist status', error: error.toString() });
//   }
// });

app.get('/wishlist/status', async (req, res) => {
  // It should be 'username' based on the expected query parameter, not 'userUsername'
  const username = req.query.username;

  if (!username) {
    console.log('Username query parameter is missing');
    return res.status(400).json({ success: false, message: 'Username query parameter is missing' });
  }

  console.log(`GET /wishlist/status - Fetching wishlist status for user: ${username}`);

  try {
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`User found: ${username}, User ID: ${user._id}`);

    const wishlistItems = await Wishlist.find({ user: user._id }).select('property -_id');
    console.log(`Wishlist items found for user ${username}:`, wishlistItems);

    const wishlistStatus = wishlistItems.map(item => item.property.toString());
    console.log(`Wishlist status for user ${username}:`, wishlistStatus);

    res.status(200).json({ success: true, wishlistStatus });
  } catch (error) {
    console.error('Error fetching wishlist status for user:', username, error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist status', error: error.toString() });
  }
});

app.get('/wishlist/status', async (req, res) => {
  // Use req.query.username instead of req.params.username
  const username = req.query.username;

  console.log(`GET /wishlist/status - Fetching wishlist for user: ${username}`);

  try {
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username query parameter is missing' });
    }
    
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      console.log(`User not found for username: ${username}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wishlistItems = await Wishlist.find({ user: user._id }).populate('property');
    console.log(`Wishlist items found for user ${username}:`, wishlistItems);
    
    // Assuming you want to send back an array of property IDs
    const propertyIds = wishlistItems.map(item => item.property._id);
    res.json({ success: true, wishlist: propertyIds });
  } catch (error) {
    console.error('Error fetching wishlist for user:', username, error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.toString() });
  }
});




// app.get('/wishlist/status', async (req, res) => {
//   const { userUsername } = req.query;

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const wishlistItems = await Wishlist.find({ user: user._id }).select('property');
//     const wishlistStatus = wishlistItems.map(item => item.property.toString());

//     res.status(200).json({ success: true, wishlistStatus });
//   } catch (error) {
//     console.error('Error fetching wishlist status:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist status', error: error.toString() });
//   }
// });


app.get('/wishlist', async (req, res) => {
  const { userId } = req.query;
  try {
      // Assuming you have a database function 'getWishlist'
      const wishlistItems = await getWishlist(userId);
      res.status(200).json(wishlistItems);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching wishlist', error });
  }
});

// Assuming Wishlist is a mongoose model
// const getWishlistStatus = async (userId) => {
//   const wishlistItems = await Wishlist.find({ user: userId }).select('property');
//   return wishlistItems.map(item => item.property.toString()); // Return an array of property IDs
// };

app.put('/property/:id', upload.single('propertyImage'), async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log('Received edit request for property ID:', propertyId); // Debugging log
    let updates = req.body;

    // Process the image file if it's part of the request
    if (req.file) {
      updates.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // Convert string fields to their appropriate types
    if ('bedrooms' in updates) {
      updates.bedrooms = Math.max(parseInt(updates.bedrooms, 10), 1);
    }
    if ('bathrooms' in updates) {
      updates.bathrooms = Math.max(parseInt(updates.bathrooms, 10), 1);
    }
    if ('price' in updates) {
      updates.price = Math.max(parseFloat(updates.price), 0);
    }
    if ('houseType' in updates) {
      updates.houseType = updates.houseType.trim();
    }

    const propertyBeforeUpdate = await Property.findById(propertyId);
    if (!propertyBeforeUpdate) {
      console.log(`Property not found for ID: ${propertyId}`);
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log(`Current property data:`, propertyBeforeUpdate);

    // Check if the price has changed and create notifications if it has
    if ('price' in updates && updates.price !== propertyBeforeUpdate.price) {
      console.log(`Price change detected for property ID: ${propertyId}. Old Price: ${propertyBeforeUpdate.price}, New Price: ${updates.price}`);
      
      const usersWithPropertyInWishlist = await Wishlist.find({ property: propertyId });
      console.log(`Found ${usersWithPropertyInWishlist.length} users with the property in wishlist`);
      
      for (const wishlistItem of usersWithPropertyInWishlist) {
        const notification = new Notification({
          user: wishlistItem.user,
          message: `Price updated for property ID: ${propertyId}`, // Include the property ID in the message
          property: propertyId
        });
        await notification.save();
        console.log(`Notification created for user ID: ${wishlistItem.user}`);
      }
    }

    // Update the property in the database
    const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
    console.log('Property updated:', updatedProperty); // Log the updated property

    res.json(updatedProperty);
  } catch (error) {
    // console.error(`Error updating property for ID: ${propertyId}`, error);
    res.status(500).json({ message: 'Error updating property data', error: error.message });
  }
});


// New route to get wishlist properties for a specific user using 'userUsername'
// app.get('/wishlist/properties/:userUsername', async (req, res) => {
//   const { userUsername } = req.params;

//   try {
//     const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const wishlistItems = await Wishlist.find({ user: user._id }).populate('property');
//     const properties = wishlistItems.map(item => item.property);

//     res.status(200).json({ success: true, properties });
//   } catch (error) {
//     console.error('Error fetching wishlist properties:', error);
//     res.status(500).json({ success: false, message: 'Error fetching wishlist properties', error: error.toString() });
//   }
// });

app.get('/wishlist/properties/:userUsername', async (req, res) => {
  const { userUsername } = req.params;

  try {
    const user = await User.findOne({ username: userUsername.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wishlistItems = await Wishlist.find({ user: user._id }).populate('property');
    // Filter out any wishlist items where the property is null
    const properties = wishlistItems.map(item => item.property).filter(property => property !== null);

    if (properties.length !== wishlistItems.length) {
      console.log('Some wishlist items have no associated property.');
    }

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching wishlist properties:', error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist properties', error: error.toString() });
  }
});


app.put('/edit-property/:propertyId', async (req, res) => {
  const { propertyId } = req.params;
  const updates = req.body;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log(`Property not found for ID: ${propertyId}`); 
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log(`Editing property ID: ${propertyId}, Updates:`, updates);


    // Check if the price has changed
    if (updates.price && property.price !== updates.price) {
      property.oldPrice = property.price;

      console.log(`Price change detected for property ID: ${propertyId}. Old Price: ${property.oldPrice}, New Price: ${updates.price}`);

      // Create a notification for all users who have this property in their wishlist
      const usersWithPropertyInWishlist = await Wishlist.find({ property: propertyId });

      console.log(`Found ${usersWithPropertyInWishlist.length} users with the property in wishlist`);

      usersWithPropertyInWishlist.forEach(async (wishlistItem) => {
        const notification = new Notification({
          user: wishlistItem.user,
          message: `Price updated for property ${propertyId}`,
          property: propertyId
        });
        await notification.save();
        console.log(`Notification created for user ID: ${wishlistItem.user}`);

      });
    }

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
    console.log(`Property updated:`, updatedProperty);
    res.json(updatedProperty);
  } catch (error) {
    console.error(`Error updating property for ID: ${propertyId}`, error);
    res.status(500).json({ message: 'Error updating property data', error: error.message });
  }
});






// app.put('/properties/:propertyId/update-tenant', async (req, res) => {
//   try {
//       const { propertyId } = req.params;
//       const { tenantUsername } = req.body;
//       const property = await Property.findById(propertyId);

//       // Check if a tenant username is provided and update it
//       if (tenantUsername !== undefined) {
//         property.tenantUsername = tenantUsername;
//         await property.save();
//         res.json({ success: true, message: 'Tenant username updated', property });
//       } else {
//         res.status(400).json({ success: false, message: 'Tenant username not provided' });
//       }
//   } catch (error) {
//       res.status(500).json({ success: false, message: 'Error updating tenant username', error: error.message });
//   }
// });

app.put('/properties/:propertyId/update-tenant', async (req, res) => {
  try {
      const { propertyId } = req.params;
      const { tenantUsername } = req.body;

      if (!tenantUsername) {
        return res.status(400).json({ success: false, message: 'Tenant username not provided' });
      }

      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Replace spaces in tenantUsername with an empty string (removes spaces)
      property.tenantUsername = tenantUsername.replace(/\s+/g, '');

      await property.save();
      res.json({ success: true, message: 'Tenant username updated', property });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating tenant username', error: error.message });
  }
});




// app.get('/notifications/:userUsername', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.userUsername });
//     if (!user) {
//       console.log(`User not found for username: ${userUsername}`);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log(`User found with ID: ${user._id}`);

//     const notifications = await Notification.find({ user: user._id }).populate('property');

//     console.log(`Found ${notifications.length} notifications for user ID: ${user._id}`);

//     res.json(notifications);
//   } catch (error) {
//     console.error(`Error fetching notifications for username: ${userUsername}`, error);
//     res.status(500).json({ message: 'Error fetching notifications', error: error.message });
//   }
// });



app.get('/notifications/:userUsername', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userUsername });
    if (!user) {
      console.log(`User not found for username: ${req.params.userUsername}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User found with ID: ${user._id}`);

    const notifications = await Notification.find({ user: user._id }).populate('property');
    console.log(`Found ${notifications.length} notifications for user ID: ${user._id}`);
    console.log('Sending notifications:', notifications);

    res.json(notifications);
  } catch (error) {
    console.error(`Error fetching notifications for username: ${req.params.userUsername}`, error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

app.get('/annual-income/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const properties = await Property.find({ ownerUsername: username }); // Assuming 'ownerUsername' is the field name in the Property model that stores the username of the owner
    const annualIncome = properties.reduce((total, property) => total + property.rentalIncome, 0); // Assuming 'rentalIncome' is the field in the Property model that stores monthly income from the property

    res.json({ annualIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// This endpoint would return all properties owned by a specific user
app.get('/properties/ownedBy/:username', async (req, res) => {
  const username = req.params.username;
  try {
    // Assuming you have a username field on the property schema
    const properties = await Property.find({ ownerUsername: username.toLowerCase() });
    res.json(properties);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// This endpoint would return all issues for a given set of property IDs
app.post('/issues/forProperties', async (req, res) => {
  const { propertyIds } = req.body;
  try {
    const issues = await Issue.find({ property: { $in: propertyIds } });
    res.json(issues);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// In your Express server routes file

app.get('/get/properties', async (req, res) => {
  try {
    console.log('API Request: Get Properties');
    const username = req.query.username;
    console.log('Username from query:', username);

    if (!username) {
      console.log('Username is required but not provided');
      return res.status(400).json({ message: 'Username is required' });
    }

    const properties = await Property.find({ username: username });
    console.log('Properties fetched:', properties);

    res.json(properties);
  } catch (error) {
    console.error('Error in /get/properties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// In your Express server routes file

// app.get('/get/issues', async (req, res) => {
//   try {
//     console.log('API Request: Get Issues');
//     const username = req.query.username;
//     console.log('Username from query:', username);

//     const allIssues = await Issue.find({});
//     console.log('All issues fetched:', allIssues);

//     if (!username) {
//       console.log('No username provided, returning all issues');
//       return res.json(allIssues);
//     }

//     const properties = await Property.find({ username: username });
//     console.log('Properties fetched for username:', properties);

//     const propertyIds = properties.map(property => property._id.toString());
//     console.log('Property IDs:', propertyIds);

//     const issuesForOwner = allIssues.filter(issue => 
//       propertyIds.includes(issue.propertyId.toString())
//     );
//     console.log('Filtered issues for owner:', issuesForOwner);

//     res.json(issuesForOwner);
//   } catch (error) {
//     console.error('Error in /get/issues:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });
app.get('/get/issues', async (req, res) => {
  try {
    console.log('API Request: Get Issues');
    const username = req.query.username;
    console.log('Username from query:', username);

    const allIssues = await Issue.find({}).lean(); // Use lean() for performance if you don't need mongoose docs features
    console.log('All issues fetched:', allIssues);

    if (!username) {
      console.log('No username provided, returning all issues');
      return res.json(allIssues);
    }

    const properties = await Property.find({ username: username }).lean(); // Assume 'username' field exists in your Property schema
    console.log('Properties fetched for username:', properties);

    // Extract the property IDs and ensure they are strings
    const propertyIds = properties.map(property => property._id.toString());
    console.log('Property IDs:', propertyIds);

    // Filter issues to only include those that belong to the user's properties
    const issuesForOwner = allIssues.filter(issue => 
      issue.property && propertyIds.includes(issue.property.toString())
    );
    console.log('Filtered issues for owner:', issuesForOwner);

    res.json(issuesForOwner);
  } catch (error) {
    console.error('Error in /get/issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/properties/:propertyId/toggle-vacancy', async (req, res) => {
  try {
      const { propertyId } = req.params;
      const { vacancy } = req.body; // Get the vacancy status from the request body
      const property = await Property.findById(propertyId);

      // Set the property vacancy to the new status
      property.vacancy = vacancy;

      await property.save();
      res.json({ success: true, message: 'Vacancy status updated', property });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating vacancy status', error: error.message });
  }
});

app.get('/annual-income/:userUsername', async (req, res) => {
  try {
    const { userUsername } = req.params;
    const properties = await Property.find({ username: userUsername, vacancy: true });
    const annualIncome = properties.reduce((total, property) => total + property.price * 12, 0);

    res.json({ annualIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(9000, () => {
  console.log(`Server Started at ${9000}`);
});
