
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    serialId: {
    type: String,
    required: true,
    unique: true,
    // Automatically generates a clean, unique serial number using the current timestamp
    default: () => `PROD-${Date.now()}`
    },
    name: { 
        type: String, 
        required: true 
    },
    size: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },

}, 

{timestamps: true} // Date user is created and updated

);

//Create Model from Schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product; // Export the model to be used in other files


// ==========================================
// ALTERNATIVE STUDY REFERENCE (OPTION B):
// ==========================================

// Alternative to Add Standard Sequential Auto-Increment (1, 2, 3...)
// const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

// const productSchema = new mongoose.Schema({
//   name: { 
//       type: String, 
//       required: true 
//   },
//   size: { 
//       type: String, 
//       required: true 
//   },
//   description: { 
//       type: String, 
//       required: true 
//   },
//   price: { 
//       type: Number, 
//       required: true 
//   },
//   quantity: { 
//       type: Number, 
//       required: true 
//   },
//   color: {
//       type: String,
//       required: true
//   },
//
// }, 
//
//   {timestamps: true}

// );

// This automatically creates a hidden field named "serialId" and increments it sequentially
// productSchema.plugin(AutoIncrement, { inc_field: 'serialId' });

// const Product = mongoose.model('Product', productSchema);
// module.exports = Product;
