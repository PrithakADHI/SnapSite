const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.']
    },

    description: {
        type: String,
        required: false
    },

    imageUrl: {
        type: String,
        required: true
    },

    publicId: { 
        type: String, 
        required: true 
    },

    userId: {
        type: String,
        required: true
    },

    tags: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

const Image = mongoose.model("Image", imageSchema);

module.exports = Image