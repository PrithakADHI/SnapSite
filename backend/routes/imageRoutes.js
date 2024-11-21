const express = require('express');
const { createImage, readAllImages, readImage, updateImage, deleteImage, searchImages } = require('../controllers/imageController.js');
const {verifyLoggedIn, verifySameUser} = require('../middlewares/authMiddleware.js');

const router = express.Router(); // Correct initialization of router

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

// CREATE
router.post('/images', verifyLoggedIn, upload.single('file'), createImage);

// READ
router.get('/images', readAllImages);
router.get('/images/:id', readImage);

// UPDATE
router.put('/images/:id', verifyLoggedIn, verifySameUser, upload.single('file'), updateImage);

// DELETE
router.delete('/images/:id', verifySameUser, deleteImage);

// SEARCH
router.get('/search/images', searchImages);

module.exports = router;
