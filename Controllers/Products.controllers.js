
const Product = require('../Models/Products.models');

//Create a product
// const createProduct = async (req, res) => {
//     try {
//         const product = new Product(req.body);
//         await product.save();
//         res.status(201).json(product);
//     } catch (error) {
//         res.status(400).json({ 
//         success: false, 
//         message: error.message
// });
//     }
// };

// module.exports = { createProduct};



//Create a product (preferable)
exports.createProduct = async (req, res) => {
    try {

        // Check if all required fields are provided
        if (!req.body.name || !req.body.size || !req.body.description || !req.body.price || !req.body.quantity )
        {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields (name, size, description, price, quantity).' 
            });
        }

        const { name, size, description, price, currency, isAvailable, quantity, color } = req.body;

        const product = new Product({name, size, description, price, currency, isAvailable, quantity, color });

        await product.save();
        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully', 
            product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating product', 
            error: error.message 
        });
    }
};

//Update a product
exports.updateProduct = async (req, res) => {
    try{
        const { id } = req.params; //where product Id is passed in the web
        const { name, size, description, price, currency, isAvailable, quantity, color } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { name, size, description, price, currency, isAvailable, quantity, color },
            { new: true, runValidators: true } // { new: true } forces MongoDB's response to show the brand-new edits immediately
        );
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully', 
            product 
        });
    }
    catch (error) {
        const status = error.name === 'CastError' ? 400 : 500;
        const msg = status === 400 ? 'Invalid product ID format' : 'Error updating product';
        res.status(status).json({ 
            success: false, 
            message: msg, 
            error: error.message 
        });
    }
};

//Get a single product by Id
exports.getProductById = async (req, res) => {
    try{
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
              return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product retrieved successfully',
            product 
        });
    } 
    
    catch (error) {
        const status = error.name === 'CastError' ? 400 : 500;
        const msg = status === 400 ? 'Invalid product ID format' : 'Error retrieving product';
        res.status(status).json({ 
            success: false, 
            message: msg, 
            error: error.message 
        });
    }
};

//Get all products
exports.getAllProducts = async (req, res) => {
    try {
      //const products = await Product.find(); //Fetches all the data in the database
        const products = await Product.find({ isAvailable: true }); // To ensure website frontend completely hides out-of-stock products from customers
        res.status(200).json({ 
            success: true, 
            message: 'All products retrieved successfully',
            count: products.length, 
            products 
        });
    }
    catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving all products', 
            error: error.message 
        });
    }
};

//Delete a product
exports.deleteProduct = async (req, res) => {
    try{
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
     } // catch (error) {
    //     res.status(500).json({ 
    //          success: false, 
    //          message: 'Error deleting product', error: error.message 
    // });
    // }

    // To distinguish between client error and server error
       catch (error) {
    // 1. If it's a CastError, use 400. Otherwise, use 500.
        const status = error.name === 'CastError' ? 400 : 500;
     // 2. If status is 400, show the format error. Otherwise, show the server failure.
        const msg = status === 400 ? 'Invalid product ID format' : 'Error deleting product';
    // 3. Send the response back to the client with the calculated status and message
        res.status(status).json({ 
            success: false, 
            message: msg, error: error.message 
        });
     }
};


