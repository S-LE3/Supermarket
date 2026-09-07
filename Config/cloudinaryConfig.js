

const cloudinary = require('cloudinary').v2;

// Inject secret credentials from .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Export authenticated cloudinary
module.exports = cloudinary;