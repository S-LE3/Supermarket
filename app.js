
// require('dotenv').config(); // 1. Load variables first
// require('./Config/databaseConfig'); // 2. Connect database next

// Third-Party Packages
const express = require('express');
const dotenv = require('dotenv');


// Load environment variables from .env file next
dotenv.config(); 
const app = express();


// Global Middleware
app.use(express.json()); //Middleware to parse JSON request bodies


//Database connection setup
const connectDB = require('./Config/databaseConfig');
connectDB(); // Connect to MongoDB


// Route Imports
const productRoute = require('./Routes/Products.routes');
const userRoute = require('./Routes/Users.routes');


//Application Routes
app.use('/', productRoute);
app.use('/', userRoute);


// Start Server
const PORT = process.env.PORT || 5000; // Fallback to port 5000 if PORT is missing
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
    
});

 

