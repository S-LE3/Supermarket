
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
}, {
  timestamps: true // Date user is created and updated 

});

//Create Model from Schema
const Product = mongoose.model('Product', productSchema);