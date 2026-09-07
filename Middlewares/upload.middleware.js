
const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require('../Config/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "SupermarketImages",
        allowed_formats: ['jpg','png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: "limit" }]
    }
});

const upload = multer({ storage: storage });

// Export the middleware
module.exports = upload;