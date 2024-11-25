const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const cloudinary = require('../cloudinaryConfig.js');

const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath); // Directory to store files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Custom filename
    },
  });

const upload = multer({ storage });

// Helper function to create a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register a new user
router.post('/register', upload.single('file'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Error: Can't Find File."
      });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_pictures',
      resource_type: 'image'
    });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user, directly using uploadResult for profile picture fields
    const user = await User.create({
      username,
      email,
      password,
      profilePicture: uploadResult.secure_url,
      profilePicturePublicId: uploadResult.public_id
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// Login user
router.post('/login/', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id }, // Payload
      process.env.JWT_SECRET, // Secret key (ensure it's consistent)
      { expiresIn: '30d' } // Token expiration
    );

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token, // Return the token to the client
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

router.get('/user/', async (req, res)=> {
  try {
    const allUsers = await User.find();
    return res.status(200).json({
      success: true,
      data: allUsers
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error: ${e}`
    });
  }
});

router.get('/user/:id/', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({"message": "Can't find the specified Image"});
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Error: ${e}`
    });
  }
});

router.put('/user/:id/', upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const file = req.file;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If there's a file, update the profile picture
    if (file) {
      if (user.profilePicturePublicId) {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      }

      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'profile_pictures',
        resource_type: 'image'
      });

      updatedData.profilePicture = uploadResult.secure_url;
      updatedData.profilePicturePublicId = uploadResult.public_id;

      fs.unlinkSync(file.path);
    }

    // Handle saving picture
    if (updatedData.savedPictureId) {
      if (!user.savedPictures.includes(updatedData.savedPictureId)) {
        user.savedPictures.push(updatedData.savedPictureId);
      }
    }

    await user.save();

    // Update other user data
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`
    });
  }
});


module.exports = router;
