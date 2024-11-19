const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const router = express.Router();

// Helper function to create a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, profilePicture } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ username, email, password, profilePicture });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
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
})

module.exports = router;
