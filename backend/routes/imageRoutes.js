const express = require('express');
const { createImage, readAllImages, readImage, updateImage, deleteImage, searchImages, imagesOfUser, readThumbnail } = require('../controllers/imageController.js');
const {verifyLoggedIn, verifySameUserForImage} = require('../middlewares/authMiddleware.js');

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
router.get('/images/thumbnail/:id', readThumbnail);

// UPDATE
router.put('/images/:id', verifyLoggedIn, verifySameUserForImage, upload.single('file'), updateImage);

// DELETE
router.delete('/images/:id', verifySameUserForImage, deleteImage);

// SEARCH
router.get('/search/images', searchImages);
router.post('/search/imageofuser', imagesOfUser);

module.exports = router;
