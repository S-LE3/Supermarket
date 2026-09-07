
const mongoose = require('mongoose');

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
      unique: true, // Enforces unique phone profiles at database level
      trim: true, 
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
      minlength: 11, // Ensures it's at least a valid 11-digit number
      maxlength: 15  // Restricts it from exceeding international phone sizes
  },
  role: {
      type: String,
      enum: ['super_admin', 'store_keeper', 'salesperson'],
      default: 'salesperson'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
},
      
//  // Real-World Supermarket Additions:
//   branchLocation: {
//       type: String,
//       required: true,
//       default: 'Main-Branch' // e.g., 'Ikorodu-Asolo', 'ShopRite-Ikeja'
//   },
//   assignedTill: {
//       type: String,
//       default: 'Not-Assigned' // e.g., 'Till_01', 'Till_02'
//   },
//   isActive: {
//       type: Boolean,
//       default: true // Allows admins to immediately lock out fired or suspended staff
//   }
}, 

{timestamps: true} // Date user is created and updated

);


//Create Model from Schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the model to be used in other files