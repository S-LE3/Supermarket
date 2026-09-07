
const express = require('express');
const router = express.Router();

// Rate Limiter
const { apiLimiter } = require('../Middlewares/rateLimit.middleware');

// Import the user controller
const userController = require('../Controllers/Users.controllers');

// Automatically injects the 100-hit/15-min barrier into all endpoints below
router.use(apiLimiter); 

//Define the routes/api endpoints

//Account Registration and Authentication
router.post('/users', userController.createUser);

// router.post('/register', userController.registerUser);

router.post('/verify-otp', userController.verifyOtp);

router.post('/resend-otp', userController.resendOtp);

router.post('/login', userController.loginUser);

// //Data Management

// router.get('/users/:id', userController.getUserById);

// router.get('/users', userController.getAllUsers);

// router.put('/users/:id', userController.updateUser);

// router.delete('/users/:id', userController.deleteUser);


//Export Router for use in other files
module.exports = router;
