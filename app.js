
require('dotenv').config(); // 1. Load variables first
require('./config/databaseConfig'); // 2. Connect database next

const express = require('express');
const app = express();
const productRoute = require('./Routes/Products.routes');

app.use(express.json()); //Middleware to parse JSON request bodies

app.use('/', productRoute);


// Start Server
const PORT = process.env.PORT || 5000; // Fallback to port 5000 if PORT is missing
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    
});

 

