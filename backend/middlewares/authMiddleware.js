const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Image = require('../models/imageModel');

const verifyLoggedIn = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure this secret is consistent

      // Find the user from the decoded token payload (user ID)
      req.user = await User.findById(decoded.id).select('-password'); // Attach user info to request

      next(); // Call the next middleware
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Invalid token' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
  }
};

const verifySameUser = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure this secret is consistent

      // Find the user from the decoded token payload (user ID)
      req.user = await User.findById(decoded.id).select('-password'); // Attach user info to request

      // Ensure the user exists and check if the user matches imageUserId

      const image = await Image.findById(req.params.id);

      if (req.user && String(req.user._id) !== String(image.userId)) {
        return res.status(403).json({ message: "User doesn't match with Database." });
      }

      next(); // Proceed to the next middleware or route
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

module.exports = {verifyLoggedIn, verifySameUser};
