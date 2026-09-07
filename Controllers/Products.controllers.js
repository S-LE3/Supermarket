
const OtpToken = require('../Models/OtpToken.models');
const Product = require('../Models/Products.models');
const cloudinary = require('../Config/cloudinaryConfig'); // Authenticated cloud wrapper
const sendEmail = require('../Utilities/emailSender.utilities');

const { formatCurrencySymbol } = require('../Utilities/formatters.utilities');
const { generateNumericOtp } = require('../Utilities/crypto.utilities');

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

// Request Product Creation Authorization Token
exports.requestProductOtp = async (req, res) => {
    try {
        // Extract the logged-in employee's email from req.user
        const employeeEmail = req.user.email.toLowerCase().trim();

        const generatedOtp = generateNumericOtp();

         // Prevent code generation spamming
        const lastToken = await OtpToken.findOne({ 
            email: employeeEmail, 
            tokenType: 'PRODUCT_CREATION' 
        }).sort({ createdAt: -1 });
        
        if (lastToken) {
            const timeSinceLastOtp = Date.now() - new Date(lastToken.createdAt).getTime();
            const cooldown = 60 * 1000;
        
            if (timeSinceLastOtp < cooldown) {
                const secondsLeft = Math.ceil((cooldown - timeSinceLastOtp) / 1000);
                return res.status(429).json({ 
                    success: false, 
                    message: `Please wait ${secondsLeft} seconds before requesting another authorization code.` 
                });
            }
        }

        const tokenLog = new OtpToken({
            email: employeeEmail, // Sends to admin tracking box
            otpCode: generatedOtp,
            tokenType: 'PRODUCT_CREATION' // Labels it specifically for products
        });
        await tokenLog.save();

        const subject = ' ACTION REQUIRED: Product Creation Code';
        const text = `SECURITY ALERT: An inventory creation sequence has been initialized.\n\nYour code is: ${generatedOtp}\n\nExpires in 5 minutes.`;
        
        sendEmail(employeeEmail, subject, text);

        res.status(200).json({ success: true, message: 'Authorization code successfully dispatched to admin inbox.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error generating code', error: error.message });
    }
};

//Create a product (preferable)
exports.createProduct = async (req, res) => {
    try {

        // Check if all required fields are provided
        if ( !req.body.name || !req.body.size || !req.body.description || !req.body.category || !req.body.price || !req.body.quantity ) //or add || !req.body.barcode || !req.body.category || !req.body.costPrice
        {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields (name, size, description, category, isAvailable, price, quantity).' //and add barcode, category, costPrice, lowStockThreshold if available in product model
            });
        }

        // Fail-Fast Gatekeeper to prevent .trim() crashes if otpCode is missing from Postman
        if (!req.body.otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your 6-digit product creation authorization OTP code.'
            });
        }

        const employeeEmail = req.user.email.toLowerCase().trim();

        const validToken = await OtpToken.findOne({ 
            email: employeeEmail,
            otpCode: req.body.otpCode.trim(),
            tokenType: 'PRODUCT_CREATION' 
        });
        if (!validToken) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        

        // // Use the below to manually run Multer in the Product controller file
        // upload.single('image')(req, res, async (err) =>{
        //     if (err) {
        //         return res.status(400).json({ 
        // success:false, 
        // message: 'Error uploading image', 
        // error: error.message });
        //     }
        // })

        // //Ensure an image file was actually uploaded in the request if set to required: true in Product model file
        // if (!req.file) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Please upload a product image.'
        //     });
        // }

        const { name, size, description, category, image, price, currency, isAvailable, quantity, color } = req.body; //and add barcode, category, costPrice, lowStockThreshold if available in product model

        const product = new Product({ 
            name, 
            size, 
            description,
            category, 
            image:  req.file ? {
                url: req.file.path,
                public_id: req.file.filename
            } : undefined, //Saves its secure Cloudinary URL and public_id directly to your MongoDB if a file was uploaded, otherwise, set it to undefined (or a default placeholder image link).
            price, 
            currency, 
            isAvailable, 
            quantity, 
            color //and add barcode, category, costPrice, lowStockThreshold if available in product model
        }); 

        await product.save();

        // Consume token immediately
        await OtpToken.deleteOne({ _id: validToken._id });

        // // Unprotected way of generating OTP
        // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a six digit otp 

        // // Send email notification to admin that a new product has been created
        // const subject = 'New Product Successfully Created';
        // const text =  `A new product has been created. Here is your OTP:${otp}\n\nName: ${name}\nSize: ${size}\nDescription: ${description}\nCategory: ${category}\nPrice: ${activeSymbol}${price}\nStock Quantity: ${quantity} units\nItem Variation: ${color || 'Standard'}`;

        // Find the correct symbol. Fall back to '₦' if the user didn't specify one (dynamic lookup).
        const activeSymbol = formatCurrencySymbol(currency);

        // Send email to admin after product has been successfully created
        const subject = 'New Product Successfully Created';
        const text = `A new product has been created:\n\n` + // or `A new product has been created:\n\nName: ${name}\nSize: ${size}\nDescription: ${description}\nCategory: ${category}\nPrice: ${activeSymbol}${price}\nStock Quantity: ${quantity} units\nItem Variation: ${color || 'Standard'}`;
             `Name: ${name}\n` +
             `Size: ${size}\n` +
             `Description: ${description}\n` +
             `Category: ${category}\n` +
             `Price: ${activeSymbol}${price}\n` + // use `Price ${currency || '₦'}${price}` for static lookup` 
             `Stock Quantity: ${quantity} units\n` +
             `Item Variation: ${color || 'Standard'}`; 
             
        sendEmail(req.user.email, subject, text) // Remove await to allow Nodemailer to dispatch the message silently in the background and to ensure Postman gets its 201 response text instantly instead of freezing to wait for Gmail's internet delays.

        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully and confirmation email dispatched.', 
            product 
        });
    } catch (error) {
        // // Handle duplicate barcode errors gracefully
        // if (error.code === 11000) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Registration failed. A product with this barcode already exists in inventory.'
        //     });
        // }
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
        const { name, size, description, category, price, currency, isAvailable, quantity, color } = req.body; //and add barcode, category, costPrice, lowStockThreshold if available in product model
        // // Gathers destructured variables into a bundle object and replaces the rigid destructuring list with a flexible object collector and copies all text edits (name, price, etc.) sent from Postman.
        // let updateFields = { name, size, description, category, price, currency, isAvailable, quantity, color };

        // // Check if a new file was uploaded, add it to that bundle object and if it exists, append the fresh Cloudinary link directly to our update data.
        // if (req.file) {
        //     updateFields.image = req.file.path;
        // }

        // Create a standalone variable for the image link above the database call
        const productImageDetails = req.file ? {
            url: req.file.path,
            public_id: req.file.filename
        } : (req.body.image ? {
            url: req.body.image.url,
            public_id: req.body.image.public_id
        } : req.body.image); // Don't use req.file.path : undefined; if not, the old image will be removed whenever a user updates a product without uploading a new one.

        // Fetch the product profile from the database before overwriting it
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' });
        }

        // If a new file is uploaded, target and destroy the old asset file in the cloud
        if (req.file && existingProduct.image && existingProduct.image.public_id) {
            await cloudinary.uploader.destroy(existingProduct.image.public_id);
        }


        const product = await Product.findByIdAndUpdate(
            id,
            { name, size, description, category, image: productImageDetails, price, currency, isAvailable, quantity, color }, //and add barcode, category, costPrice, lowStockThreshold if available in product model

            // // Use to pass the dynamic object list instead of a fixed hardcoded property bracket
            //  const product = await Product.findByIdAndUpdate(
            // id,
            // updateData, 
            { returnDocument: 'after', runValidators: true } // { returnDocument: 'after' } forces MongoDB's response to show the brand-new edits immediately and it is the updated version of { new: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully', 
            product 
        });
    }
    catch (error) {
        // if (error.code === 11000) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Update failed. This barcode is already assigned to another product.'
        //     });
        // }
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

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

         // To erase the physical photo file from Cloudinary 
        if (product.image && product.image.public_id) {
            await cloudinary.uploader.destroy(product.image.public_id);
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
     } // catch (error) {
    //     res.status(500).json({ 
    //          success: false, 
    //          message: 'Error deleting product', 
    //          error: error.message 
    // });
    // }

    // To distinguish between client error and server error
       catch (error) {
    // If it's a CastError, use 400. Otherwise, use 500.
        const status = error.name === 'CastError' ? 400 : 500;
     // If status is 400, show the format error. Otherwise, show the server failure.
        const msg = status === 400 ? 'Invalid product ID format' : 'Error deleting product';
    // Send the response back to the client with the calculated status and message
        res.status(status).json({ 
            success: false, 
            message: msg, 
            error: error.message 
        });
     }
};


