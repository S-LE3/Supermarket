
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

// Import Rate Limiter
const { apiLimiter } = require('./Middlewares/rateLimit.middleware');

//Database connection setup
const connectDB = require('./Config/databaseConfig');
connectDB(); // Connect to MongoDB

// // Global application of Rate Limiter to all endpoints starting with /
// app.use('/', apiLimiter);

// Route Imports
const productRoute = require('./Routes/Products.routes');
const userRoute = require('./Routes/Users.routes');

//Application Routes
app.use('/api', productRoute);
app.use('/api', userRoute);


// Start Server
const PORT = process.env.PORT || 5000; // Fallback to port 5000 if PORT is missing
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});
