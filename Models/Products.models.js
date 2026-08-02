
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
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
}, 

{
  timestamps: true // Date user created and updated at 

});

//Create Model from Schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product; // Export the model to be used in other files