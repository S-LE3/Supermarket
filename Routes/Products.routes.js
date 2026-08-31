
const express = require('express');

//Import authentication middleware
const verifyToken = require('../Middlewares/auth.middleware');

const router = express.Router(); //

//Import the product controller
const productController = require('../Controllers/Products.controllers');


//Define the routes:

//Public endpoints (anyone can view)
router.get('/products/:id', productController.getProductById);

router.get('/products', productController.getAllProducts);

//Protected endpoints (checks if user has a valid badge/token)
router.post('/products', verifyToken, productController.createProduct);

router.put('/products/:id', verifyToken, productController.updateProduct);

router.delete('/products/:id', verifyToken, productController.deleteProduct);

//Export Router for use in other files
module.exports = router;