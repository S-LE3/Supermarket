
const express = require('express');
const router = express.Router(); //

//Import the product controller
const productController = require('../Controllers/Products.controllers');


//Define the routes
router.post('/products', productController.createProduct);

router.get('/products', productController.getAllProducts);

router.get('/products/:id', productController.getProductById);

router.put('/products/:id', productController.updateProduct);

router.delete('/products/:id', productController.deleteProduct);

//Export Router for use in other files
module.exports = router;