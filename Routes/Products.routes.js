
const express = require('express');

//Import authentication middleware
const verifyToken = require('../Middlewares/auth.middleware');

//Import authentication middleware
const { authorization } = require('../Middlewares/role.middleware');

const router = express.Router(); //

//Import the product controller
const productController = require('../Controllers/Products.controllers');

//Image Middleware (add to Product controller file instead if manually running Multer from the product controller file).
const upload = require('../Middlewares/upload.middleware');


//Define the routes:

//Public endpoints (anyone can view)
router.get('/products/:id', productController.getProductById);

router.get('/products', productController.getAllProducts);

//Protected endpoints (checks if user has a valid badge/token)
// Request the 5-min code
router.post('/products/request-otp', verifyToken, productController.requestProductOtp); 
// Use upload.single('image') in the Product routes file to automatically run Multer
router.post('/products', verifyToken, authorization('store_keeper', 'super_admin'), upload.single('image'), productController.createProduct);
// router.post('/productswithimage', verifyToken, productController.createProductWithImage); // Add line to product route if using Multer in controller

router.put('/products/:id', verifyToken, authorization('store_keeper', 'super_admin'), upload.single('image'), productController.updateProduct);

router.delete('/products/:id', verifyToken, authorization('super_admin'), productController.deleteProduct);

//Export Router for use in other files
module.exports = router;