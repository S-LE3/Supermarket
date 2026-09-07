
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

    serialId: {
    type: String,
    required: true,
    // Automatically generates a clean, unique serial number using the current timestamp and appends a random 4-digit number to guarantee uniqueness even within the same millisecond
    default: () => `PROD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Automatically generates a clean, unique serial number using the current timestamp
    //default: () => `PROD-${Date.now()}`
    },

    // //Added field for physical cash-register laser scanning
    // barcode: {
    //     type: String,
    //     required: true,
    //     unique: true, // Crucial: Prevents duplicate scanner overlapping
    //     trim: true
    // },

    name: { 
        type: String, 
        required: true, 
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    size: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    // //Tracked to calculate corporate revenue vs investment profit balances
    // costPrice: {
    //     type: Number,
    //     required: true,
    //     min: 0
    // },

    image: {
    url: {
        type: String,
        required: false
    },
    public_id: {
        type: String,
        required: false // Ensures every image can be deleted from the cloud later
    }
    },

    price: {
        type: Number,
        required: true,
        min: 0 // Prevents negative numbers from being saved
    },

    currency: { 
        type: String, 
        required: true, 
        enum: ['NGN', 'USD', 'GBP', 'EUR'], // Restricts input to these choices
        default: 'NGN' // Automatically uses NGN if none is provided
    },

    isAvailable: {
        type: Boolean,
        default: true // New products are marked as available automatically
    },

    quantity: {
        type: Number,
        required: true,
        min: 0 // Prevents negative inventory stock levels
    },

    // //Automates procurement triggers before shelf items completely run out
    // lowStockThreshold: {
    //     type: Number,
    //     required: true,
    //     default: 10 // Prompts a system warning if quantity falls to/below this
    // },

    color: {
        type: String
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

// //Added field for physical cash-register laser scanning
// barcode: {
//     type: String,
//     required: true,
//     unique: true, // Crucial: Prevents duplicate scanner overlapping
//     trim: true
// },

//   name: { 
//       type: String, 
//       required: true 
//   },

// category: {
//     type: String,
//     required: true, 
//     trim: true
// },

//   size: { 
//       type: String, 
//       required: true 
//   },

//   description: { 
//       type: String, 
//       required: true 
//   },

// //Tracked to calculate corporate revenue vs investment profit balances
//   costPrice: {
//       type: Number,
//       required: true,
//       min: 0
//   },

//   image: {
//       type: String,
//       required: false // Adds a  photo to every supermarket product that it is required
//   },

//   price: { 
//       type: Number, 
//       required: true 
//   },

//   currency: { 
//       type: String, 
//       required: true, 
//       enum: ['NGN', 'USD', 'GBP', 'EUR'], // Restricts input to these choices
//       default: 'NGN' // Automatically uses NGN if none is provided
//   },

//   quantity: { 
//       type: Number, 
//       required: true 
//   },

// //Automates procurement triggers before shelf items completely run out
//  lowStockThreshold: {
//      type: Number,
//      required: true,
//      default: 10 // Prompts a system warning if quantity falls to/below this
//     },

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
