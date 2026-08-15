
const express = require('express');
const router = express.Router();


// Import the user controller
const userController = require('../Controllers/Users.controllers');


//Define the routes

//Account Registration and Authentication
router.post('/users', userController.createUser);

router.post('/login', userController.loginUser);

// //Data Management
// router.get('/users', userController.getAllUsers);

// router.get('/users/:id', userController.getUserById);

// router.put('/users/:id', userController.updateUser);

// router.delete('/users/:id', userController.deleteUser);


//Export Router for use in other files
module.exports = router;
