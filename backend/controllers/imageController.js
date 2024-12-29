const Image = require('../models/imageModel.js');
const mongoose = require('mongoose');

const cloudinary = require('../cloudinaryConfig.js');

const streamifier = require('streamifier');
// CREATE

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

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'images',
                        resource_type: 'image'
                    },
                    (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        const uploadResult = await streamUpload(file.buffer);

        req.body.imageUrl = uploadResult.secure_url;
        req.body.publicId = uploadResult.public_id;

        const newImage = await Image.create(req.body);

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
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1
        const limit = parseInt(req.query.limit, 10) || 20; // Default limit to 20 images per request

        // Aggregation pipeline to ensure unique images and randomize results
        const allImages = await Image.aggregate([
            {
                $group: {
                    _id: "$_id", // Ensure unique images based on their `_id` field
                    data: { $first: "$$ROOT" }, // Pick the first occurrence
                },
            },
            { $replaceRoot: { newRoot: "$data" } }, // Replace root to flatten the object
            { $sample: { size: limit } }, // Randomly select `limit` number of images
        ]);

        return res.status(200).json({
            success: true,
            data: allImages,
            currentPage: page,
            hasMore: allImages.length === limit, // Indicate if more images are likely available
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `Error: ${e}`,
        });
    }
};





const readThumbnail = async (req, res) => {
    try {
        const imageId = req.params.id;

        // Fetch the image document from the database
        const image = await Image.findById(imageId);

        // Check if the image exists
        if (!image) {
            return res.status(404).json({ message: "Can't find the specified image." });
        }

        // Send the image URL in the response
        return res.status(200).json({ thumbnailUrl: image.imageUrl });
    } catch (error) {
        console.error("Error fetching image:", error.message);
        return res.status(500).json({ message: "An error occurred while fetching the image." });
    }
};

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
        const file = req.file;

        // Find the existing image in the database
        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // If a new file is uploaded, upload it to Cloudinary and update the image URL and public ID
        if (file) {
            // Delete old image from Cloudinary (if it exists)
            if (image.publicId) {
                await cloudinary.uploader.destroy(image.publicId);
            }

            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'images',
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    streamifier.createReadStream(fileBuffer).pipe(stream);
                })
            }

            // Upload the new image to Cloudinary
            const uploadResult = await streamUpload(file.buffer);

            // Add the new image URL and public ID to the update data
            updatedData.imageUrl = uploadResult.secure_url;
            updatedData.publicId = uploadResult.public_id;

        }

        // Update the image document in the database with the new data
        const updatedImage = await Image.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation rules are applied
        });

        if (!updatedImage) {
            return res.status(404).json({ message: "Image not found after update" });
        }

        return res.status(200).json({
            success: true,
            data: updatedImage,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: `Error: ${e.message}`,
        });
    }
};


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

// SEARCH

const searchImages = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    try {
        const images = await Image.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
              ],
        })

        res.status(200).json({ success: true, data: images });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

const imagesOfUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "No UserID Provided." });
        }

        const images = await Image.find({ userId });

        if (images.length === 0) {
            return res.status(200).json({ success: true, message: [] });
        }

        return res.status(200).json({ success: true, data: images });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message })
    }
}

module.exports = {
    createImage,
    readAllImages,
    readImage,
    updateImage,
    deleteImage,
    searchImages,
    imagesOfUser,
    readThumbnail
}