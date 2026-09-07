
const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true // Works for the admin's email and the registering user's email!
    },

    otpCode: {
        type: String,
        required: true,
        trim: true
    },

    tokenType: {
        type: String,
        required: true,
        enum: ['PRODUCT_CREATION', 'USER_VERIFICATION'] // Explicitly labels the business purpose
    },

    attempts: {
        type: Number,
        default: 0 // Starts tracking wrong guesses at 0
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Automatically wipes the token after 300 seconds (5 minutes)
    }
});

module.exports = mongoose.model('OtpToken', otpTokenSchema);