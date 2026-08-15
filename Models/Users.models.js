
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
      unique: true,
      trim: true, // Automatically removes accidental spaces
      lowercase: true // Automatically converts "User@Email.com" to "user@email.com"
  },
  password: { 
      type: String, 
      required: true,
      minlength: 6, // Forces passwords to be at least 6 characters
      maxlength: 100 // Maximum limit: Prevents excessively long string spam
  },
  gender: { 
      type: String
  },
  hasAdminAccess: {
      type: Boolean,
      default: false
  },
  phone: { 
      type: String, 
      required: true,
      minlength: 10, // Ensures it's at least a valid 10-digit number
      maxlength: 15  // Restricts it from exceeding international phone sizes
  },
  role: {
      type: String,
      enum: ['super_admin', 'store_keeper', 'salesperson'],
      default: 'salesperson'
  },
}, 

{timestamps: true} // Date user is created and updated

);


//Create Model from Schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the model to be used in other files