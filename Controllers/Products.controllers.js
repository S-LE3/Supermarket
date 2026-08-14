
const Product = require('../Models/Products.models');

//Create a product
// const createProduct = async (req, res) => {
//     try {
//         const product = new Product(req.body);
//         await product.save();
//         res.status(201).json(product);
//     } catch (error) {
//         res.status(400).json({message: error.message});
//     }
// };

// module.exports = { createProduct};



//Create a product (preferable)
exports.createProduct = async (req, res) => {
    try {
        const { name, size, description, price, currency, quantity, color } = req.body;

        const product = new Product({name, size, description, price, currency, quantity, color });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message })
    }
};

//Update a product
exports.updateProduct = async (req, res) => {
    try{
        const { id } = req.params; //where product Id is passed in the web
        const { name, size, description, price, currency, quantity, color } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { name, size, description, price, currency, quantity, color },
            { new: true, runValidators: true } // { new: true } forces MongoDB's response to show the brand-new edits immediately
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
}

//Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); //Fetches all the data in the database
        res.status(200).json({ success: true, count: products.length, products });
    }
    catch (error) {
         res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

//Get a single product by Id
exports.getProductById = async (req, res) => {
    try{
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
              return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ success: true, product });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

//Delete a product
exports.deleteProduct = async (req, res) => {
    try{
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
    // To distinguish between client error and server error
    //   catch (error) {
    // 1. If it's a CastError, use 400. Otherwise, use 500.
    //     const status = error.name === 'CastError' ? 400 : 500;
     // 2. If status is 400, show the format error. Otherwise, show the server failure.
    //     const msg = status === 400 ? 'Invalid product ID format' : 'Error fetching product';
    // 3. Send the response back to the client with the calculated status and message
    //     res.status(status).json({ message: msg, error: error.message });
    // }



    