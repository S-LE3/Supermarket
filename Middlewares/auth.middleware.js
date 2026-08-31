
const jwt = require('jsonwebtoken');


//Middleware to verify token

const verifyToken = (req, res, next) => {
    try {
    // 1. Grab the token sent from the frontend headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }
    // 2. Extract the actual token string by splitting off the word "Bearer "
        const token = authHeader.split(' ')[1];
    // 3. Decode and verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 4. Attach the decoded user data directly to the request object
        req.user = decoded; 
    // 5. Tell Express to move on to your controller
        next(); 
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.',
            error: error.message
        });
    }
};

module.exports = verifyToken;

// exports.protect = (req, res, next) => {
//     const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; //get token from
//     if (!token) {
//         return res.status(401).json({ 
//             success: false, 
//             message: 'Not authorized, no token' 
//         });
//     }

//     try{
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({ 
//             success: false, 
//             message: 'Invalid or expired token.'
//         });
//     }
// }
