const Image = require('../models/imageModel.js');
const mongoose = require('mongoose');

const cloudinary = require('../cloudinaryConfig.js');
// CREATE
const fs = require('fs');

const createImage = async (req, res) => {
    try {
        req.body.userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Error: Can't Find File."
            });
        }

        const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'images',
            resource_type: 'image'
        });

        req.body.imageUrl = uploadResult.secure_url;
        req.body.publicId = uploadResult.public_id;

        const newImage = await Image.create(req.body);

        // Delete local file
        fs.unlinkSync(file.path);

        return res.status(201).json({
            success: true,
            data: newImage
        });
    } catch (e) {
        console.error("Error in createImage:", e); // Log error details
        return res.status(500).json({
            success: false,
            message: `Error: ${e.message}`
        });
    }
};


// READ

const readAllImages = async (req, res) => {
    try {
    const allImages = await Image.find();
    return res.status(200).json({
        success: true,
        data: allImages
    });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error: ${e}`
        });
    }
}

const readImage = async (req, res) => {
    try {
        const imageId = req.params.id;
        const image = await Image.findById(imageId)
        if (!image) {
            return res.status(404).json({"message": "Can't find the specified Image"});
        }
        
        return res.status(200).json({
            success: true,
            data: image
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error: ${e}`
        });
    }
}

// UPDATE

const updateImage = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        const image = await Image.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        })

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        return res.status(200).json({
            success: true,
            data: image
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error: ${e}`
        });
    }
}

// DELETE

const deleteImage = async (req, res) => {
    try {
        const id = req.params.id;

        // Validate if id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Image ID" });
        }

        const image = await Image.findByIdAndDelete(id);

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Image Successfully Deleted."
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error: ${e.message}`
        });
    }
};

module.exports = {
    createImage,
    readAllImages,
    readImage,
    updateImage,
    deleteImage
}