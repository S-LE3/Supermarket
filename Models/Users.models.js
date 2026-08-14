
const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
      type: String, 
      required: true 
  },
  email: { 
      type: String, 
      required: true,
      unique: true
  },
  password: { 
      type: String, 
      required: true 
  },
  sex: { 
      type: String, 
      required: true 
  },
  hasAtmCard: {
    type: Boolean,
    default: false
  },
  phone: { 
      type: String, 
      required: true 
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
}, 

{timestamps: true} // Date user is created and updated

);


//Create Model from Schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the model to be used in other files