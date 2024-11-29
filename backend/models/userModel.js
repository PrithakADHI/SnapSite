const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the user
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is Required."],
        unique: [true, "Username already exists."]
    },
    email: {
        type: String,
        required: [true, "Email is Required."],
        unique: [true, "Email already exists."]
    },
    password: {
        type: String,
        required: true
    },

    profilePicture: {
        type: String,
        required: false
    },

    profilePicturePublicId: {
        type: String,
        required: false
    },

    savedPictures: {
        type: Array,
        required: false
    },

    followers: {
        type: Array,
        required: false
    },

    following: {
        type: Array,
        required: false
    }
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords for login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const User = mongoose.model('User', userSchema); // Use mongoose.model() here

module.exports = User;
